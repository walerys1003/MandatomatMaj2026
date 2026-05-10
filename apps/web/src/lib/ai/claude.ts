/**
 * Claude wrapper — rozszerzenie `anthropic.ts` o:
 *  - PRICING table (per model, per 1M tokens — input/output) → koszt $ per call
 *  - generateDocument (Sonnet, JSON output) — pisma prawne
 *  - scoringAnalysis (Haiku, fast + tani) — darmowe scoring `/sprawdz-szanse`
 *  - validateDocument (Haiku) — walidacja wygenerowanego pisma (czek list)
 *
 * Wszystkie funkcje rzucają `AnthropicError` przy problemie.
 * Zwracają `{ data, usage, costUsd }` żeby logować zużycie do `events`.
 */

import {
  callClaude,
  AnthropicError,
  type AnthropicContentBlock,
  type AnthropicResult,
} from './anthropic'

// ============================================================================
// PRICING — $ per 1M tokens (stan: maj 2026, oficjalne ceny Anthropic)
// ============================================================================

export interface ModelPricing {
  /** $ per 1M input tokens. */
  input: number
  /** $ per 1M output tokens. */
  output: number
  /** Display name dla logów. */
  label: string
}

export const PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0, label: 'Sonnet 4.5' },
  'claude-haiku-4-5': { input: 1.0, output: 5.0, label: 'Haiku 4.5' },
  'claude-opus-4-5': { input: 15.0, output: 75.0, label: 'Opus 4.5' },
}

export function calcCostUsd(
  model: string,
  usage: { input_tokens: number; output_tokens: number },
): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-5-20250929']!
  const inCost = (usage.input_tokens / 1_000_000) * p.input
  const outCost = (usage.output_tokens / 1_000_000) * p.output
  return Math.round((inCost + outCost) * 1_000_000) / 1_000_000 // 6-cyfrowa precyzja
}

// ============================================================================
// Helper — JSON extraction z odpowiedzi Claude'a
// ============================================================================

/**
 * Claude czasem zwraca JSON owinięty w ```json ... ``` lub z tekstem przed/po.
 * Wycinamy pierwszy obiekt JSON ({...}).
 */
export function extractJson(text: string): unknown {
  // ```json ... ```
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]+?)\n?```/i)
  const candidate = fenced?.[1] ?? text

  // Pierwszy { ... } na poziomie nawiasów
  const start = candidate.indexOf('{')
  if (start === -1) {
    throw new AnthropicError('Brak JSON w odpowiedzi modelu')
  }

  let depth = 0
  let inString = false
  let escape = false
  let end = -1
  for (let i = start; i < candidate.length; i++) {
    const c = candidate[i]
    if (escape) {
      escape = false
      continue
    }
    if (c === '\\') {
      escape = true
      continue
    }
    if (c === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }

  if (end === -1) {
    throw new AnthropicError('Niedomknięty JSON w odpowiedzi modelu')
  }

  const jsonStr = candidate.slice(start, end + 1)
  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    throw new AnthropicError(
      'JSON parse error',
      undefined,
      e instanceof Error ? e.message : e,
    )
  }
}

// ============================================================================
// Wynik z metadanymi (usage + koszt)
// ============================================================================

export interface ClaudeCallResult<T> {
  data: T
  raw: AnthropicResult
  model: string
  costUsd: number
}

// ============================================================================
// generateDocument — Sonnet, JSON-mode, retries
// ============================================================================

export interface GenerateDocumentOptions {
  systemPrompt: string
  userPrompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  /** Liczba prób gdy JSON nie sparsuje się / Zod nie przejdzie. Default: 2. */
  maxRetries?: number
}

/**
 * Generuje strukturalny dokument JSON. Caller dostaje surowy JSON,
 * walidację Zod robi po stronie API route (bo schemy są tam blisko routy).
 */
export async function generateDocument(
  opts: GenerateDocumentOptions,
): Promise<ClaudeCallResult<unknown>> {
  const model = opts.model ?? 'claude-sonnet-4-5-20250929'
  const maxRetries = opts.maxRetries ?? 2

  let lastErr: unknown = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await callClaude({
        model,
        system: opts.systemPrompt,
        messages: [{ role: 'user', content: opts.userPrompt }],
        maxTokens: opts.maxTokens ?? 3072,
        temperature: opts.temperature ?? 0.3,
      })

      const data = extractJson(raw.text)
      return {
        data,
        raw,
        model,
        costUsd: calcCostUsd(model, raw.usage),
      }
    } catch (e) {
      lastErr = e
      // Retry tylko dla błędów parse (nie sieciowych 4xx/5xx)
      if (e instanceof AnthropicError && e.status && e.status >= 400 && e.status < 500) {
        throw e
      }
      // Czekaj 250ms × 2^attempt przed retry
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 250 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new AnthropicError('Nieznany błąd generowania')
}

// ============================================================================
// scoringAnalysis — Haiku, free tier (rate-limited /sprawdz-szanse)
// ============================================================================

export interface ScoringInput {
  caseType: string // np. "M1_mandat_predkosc" lub generic "mandat", "windykacja"
  description: string // user-provided opis sprawy (50–2000 znaków)
  hasEvidence?: boolean
  eventDate?: string // ISO yyyy-mm-dd
}

export interface ScoringResult {
  score: number // 0..1
  label: 'wysokie' | 'umiarkowane' | 'niskie' | 'bardzo_niskie'
  reasoning: string
  recommendations: string[]
  legal_basis_hints: string[]
  estimated_complexity: 'low' | 'medium' | 'high'
}

const SCORING_SYSTEM_PROMPT = `Jesteś doświadczonym prawnikiem oceniającym SZANSE skuteczności
odwołania/sprzeciwu w polskich sprawach administracyjnych i wykroczeniowych.

Twoje zadanie: ocenić sprawę użytkownika i zwrócić STRUKTURALNY scoring 0.0–1.0
oraz argumenty uzasadniające ocenę.

ZASADY:
1. Bądź realistyczny — nie zawyżaj szans by "uprzejmie zachęcić" do zakupu.
2. Bądź pomocny — wskaż 2–4 konkretne kroki/argumenty, które user może wykorzystać.
3. Wskaż 1–3 podstawy prawne (artykuły) które są kluczowe dla tego typu sprawy.
4. Określ złożoność (low/medium/high) — czy wymaga prawnika czy wystarczy generator.

OUTPUT — ŚCIŚLE JSON, BEZ KOMENTARZY POZA NIM:

{
  "score": 0.67,
  "label": "umiarkowane",
  "reasoning": "Uzasadnienie 2-4 zdaniami...",
  "recommendations": ["...", "..."],
  "legal_basis_hints": ["art. 92a § 1 KW", "..."],
  "estimated_complexity": "low"
}

Pole "label" musi być spójne z "score":
  - wysokie:        score >= 0.75
  - umiarkowane:    0.50 <= score < 0.75
  - niskie:         0.30 <= score < 0.50
  - bardzo_niskie:  score < 0.30`

export async function scoringAnalysis(
  input: ScoringInput,
): Promise<ClaudeCallResult<ScoringResult>> {
  const model = 'claude-haiku-4-5'
  const userPrompt = `Oceń szanse w sprawie:

TYP SPRAWY: ${input.caseType}
${input.eventDate ? `DATA ZDARZENIA: ${input.eventDate}` : ''}
${input.hasEvidence ? 'UŻYTKOWNIK MA DOWODY: tak' : 'UŻYTKOWNIK MA DOWODY: nieznane/brak'}

OPIS UŻYTKOWNIKA:
"""
${input.description}
"""

Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt. Bez komentarzy.`

  const raw = await callClaude({
    model,
    system: SCORING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 1024,
    temperature: 0.3,
  })

  const parsed = extractJson(raw.text) as ScoringResult

  // Sanity check + label spójność
  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 1) {
    throw new AnthropicError('Scoring poza zakresem 0..1')
  }
  // Re-derive label żeby model nie kłamał
  parsed.label =
    parsed.score >= 0.75
      ? 'wysokie'
      : parsed.score >= 0.5
        ? 'umiarkowane'
        : parsed.score >= 0.3
          ? 'niskie'
          : 'bardzo_niskie'

  return {
    data: parsed,
    raw,
    model,
    costUsd: calcCostUsd(model, raw.usage),
  }
}

// ============================================================================
// parseOcrDocument — Claude vision parser dla mandatów/wezwań/nakazów
// ============================================================================

/** Typy dokumentów które OCR rozpoznaje + parsuje. */
export type OcrDocumentType =
  | 'mandat'
  | 'wezwanie_parking'
  | 'wezwanie_zapłaty'
  | 'nakaz_zapłaty'
  | 'pismo_urzędowe'
  | 'inne'

export interface OcrParsedDocument {
  /** Rozpoznany typ dokumentu. */
  document_type: OcrDocumentType
  /** Confidence rozpoznania (0..1). */
  confidence: number
  /** Surowy tekst odczytany z dokumentu (do podglądu w UI). */
  raw_text: string
  /** Pola wykryte i znormalizowane — używane do auto-fill formularza. */
  fields: {
    numer_mandatu?: string
    numer_wezwania?: string
    numer_sprawy?: string
    data_zdarzenia?: string // ISO yyyy-mm-dd
    data_pisma?: string // ISO yyyy-mm-dd
    data_wymagalnosci?: string
    miejsce_zdarzenia?: string
    organ?: string
    wierzyciel?: string
    przewoznik?: string
    zarzadca_strefy?: string
    nazwa_strazy?: string
    kwota?: number // PLN
    waluta?: string // domyślnie 'PLN'
    numer_rejestracyjny?: string
    rodzaj_wykroczenia?: string
    artykuly_powolane?: string[]
    [key: string]: unknown
  }
  /** Sugerowany typ sprawy w katalogu Mandatomat (np. M1, M4, P1, P3, W1). */
  suggested_case_type?: string
  /** Ostrzeżenia (np. "termin minął", "nieczytelne pole"). */
  warnings: string[]
}

const OCR_SYSTEM_PROMPT = `Jesteś ekspertem OCR i klasyfikatorem dokumentów prawnych
w Polsce. Otrzymujesz zdjęcie/skan dokumentu (mandat karny, wezwanie do zapłaty
za parking/przejazd, nakaz zapłaty, pismo urzędowe).

Twoje zadania:
1. ROZPOZNAJ typ dokumentu (mandat / wezwanie_parking / wezwanie_zapłaty /
   nakaz_zapłaty / pismo_urzędowe / inne).
2. ODCZYTAJ czytelny tekst z dokumentu (raw_text — pełna treść, do 3000 znaków).
3. WYEKSTRAHUJ kluczowe pola i ZNORMALIZUJ je do struktury JSON.
4. ZASUGERUJ typ sprawy w naszym katalogu (M1=mandat za prędkość, M4=mandat za pasy,
   P1=parking SPP, P3=parking ZTM/MPK, W1=windykacja przedawniona).
5. OSTRZEŻ użytkownika gdy: termin minął, brak kluczowego pola, dokument nieczytelny.

NORMALIZACJA POLA:
- Daty → ISO 8601 (yyyy-mm-dd). Jeśli format polski "12 marca 2025 r." → "2025-03-12".
- Kwoty → liczba w PLN bez separatorów ("500 zł" → 500, "1 234,56 zł" → 1234.56).
- Numery rejestracyjne → uppercase bez spacji ("WX 12345" → "WX12345").
- Organ/instytucja → pełna nazwa ("KMP Warszawa" → "Komenda Miejska Policji w Warszawie").

OUTPUT — ŚCIŚLE JSON, BEZ KOMENTARZY:

{
  "document_type": "mandat",
  "confidence": 0.92,
  "raw_text": "...",
  "fields": {
    "numer_mandatu": "AA 1234567",
    "data_zdarzenia": "2025-03-12",
    "miejsce_zdarzenia": "Warszawa, ul. Marszałkowska",
    "organ": "Komenda Miejska Policji w Warszawie",
    "kwota": 500,
    "rodzaj_wykroczenia": "przekroczenie prędkości",
    "artykuly_powolane": ["art. 92a § 1 KW"]
  },
  "suggested_case_type": "M1_mandat_predkosc",
  "warnings": []
}

ZASADY:
- Nie zgaduj pól których NIE WIDZISZ — pomiń je w "fields" zamiast wpisywać "?".
- Confidence < 0.5 = zwróć dokument_type="inne" i ostrzeż w "warnings".
- Jeśli dokument jest nieczytelny: confidence < 0.3, raw_text="" lub fragmenty.
- Nigdy nie wymyślaj numerów, dat ani kwot — tylko to co rzeczywiście widać.`

export interface ParseOcrInput {
  /** Base64-encoded zawartość obrazka (bez prefixu data:). */
  imageBase64: string
  /** MIME type obrazka (jpeg/png/webp). */
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Opcjonalna podpowiedź użytkownika (np. "to jest mandat za pasy"). */
  userHint?: string
}

/**
 * Parsuje obrazek dokumentu prawnego do strukturalnego JSON-a.
 * Używa Claude Sonnet (vision) — Haiku ma gorszą jakość OCR.
 */
export async function parseOcrDocument(
  input: ParseOcrInput,
): Promise<ClaudeCallResult<OcrParsedDocument>> {
  const model = 'claude-sonnet-4-5-20250929'

  const userBlocks: AnthropicContentBlock[] = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.mediaType,
        data: input.imageBase64,
      },
    },
    {
      type: 'text',
      text: input.userHint
        ? `Sparsuj ten dokument. Podpowiedź użytkownika: "${input.userHint}". Zwróć WYŁĄCZNIE JSON zgodnie z formatem.`
        : 'Sparsuj ten dokument. Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt.',
    },
  ]

  const raw = await callClaude({
    model,
    system: OCR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userBlocks }],
    maxTokens: 2048,
    temperature: 0.1, // bardzo niska — chcemy faktów, nie kreatywności
  })

  const parsed = extractJson(raw.text) as OcrParsedDocument

  // Sanity checks
  if (typeof parsed.confidence !== 'number') {
    parsed.confidence = 0
  }
  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence))
  if (!Array.isArray(parsed.warnings)) parsed.warnings = []
  if (!parsed.fields || typeof parsed.fields !== 'object') {
    parsed.fields = {}
  }
  if (typeof parsed.raw_text !== 'string') {
    parsed.raw_text = ''
  }
  // Niska confidence → ostrzeżenie
  if (parsed.confidence < 0.5 && parsed.warnings.length === 0) {
    parsed.warnings.push(
      'Niska pewność rozpoznania. Sprawdź dokładnie wszystkie pola przed użyciem.',
    )
  }

  return {
    data: parsed,
    raw,
    model,
    costUsd: calcCostUsd(model, raw.usage),
  }
}

// ============================================================================
// validateDocument — Haiku, walidacja wygenerowanego pisma (T11 chunk)
// ============================================================================

export interface ValidationResult {
  passed: boolean
  score: number // 0..100
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    category: 'legal' | 'formal' | 'factual' | 'style'
    message: string
    suggestion?: string
  }>
  checklist: {
    has_addressee: boolean
    has_petitioner: boolean
    has_legal_basis: boolean
    has_signature_placeholder: boolean
    has_date_placeholder: boolean
    cited_acts_valid: boolean
    no_hallucinated_articles: boolean
  }
}

const VALIDATION_SYSTEM_PROMPT = `Jesteś prawnikiem-recenzentem. Sprawdzasz czy pismo
prawne wygenerowane przez AI spełnia formalne i merytoryczne wymagania polskiego
prawa.

OCEŃ:
1. STRUKTURA: czy ma adresata, dane wnoszącego, treść żądania, uzasadnienie, miejsce
   na podpis i datę?
2. PODSTAWY PRAWNE: czy powołane artykuły faktycznie istnieją w wymienionych ustawach
   (KW, KPA, KC, KPSW, PoRD)?
3. ARGUMENTACJA: czy ma sens prawny, jest spójna, nie zawiera halucynacji?
4. STYL: formalny urzędowy, bez emocji, bez gróźb procesowych?
5. KOMPLETNOŚĆ: czy nie brakuje jakiegoś krytycznego elementu (np. wniosku końcowego)?

OUTPUT — ŚCIŚLE JSON:

{
  "passed": true,
  "score": 87,
  "issues": [
    {
      "severity": "warning",
      "category": "formal",
      "message": "Brak konkretnego wniosku końcowego",
      "suggestion": "Dodaj 'Wnoszę o uchylenie mandatu' na końcu pisma."
    }
  ],
  "checklist": {
    "has_addressee": true,
    "has_petitioner": true,
    "has_legal_basis": true,
    "has_signature_placeholder": true,
    "has_date_placeholder": true,
    "cited_acts_valid": true,
    "no_hallucinated_articles": true
  }
}

ZASADY:
- "passed" = true tylko gdy NIE ma issues z severity="error"
- "score" odzwierciedla ogólną jakość: 90+ excellent, 70-89 good, 50-69 needs_review, <50 fail
- Bądź konkretny w "message" i "suggestion" — user musi wiedzieć co poprawić`

export async function validateDocument(
  documentMd: string,
  caseType: string,
): Promise<ClaudeCallResult<ValidationResult>> {
  const model = 'claude-haiku-4-5'
  const userPrompt = `Zwaliduj poniższe pismo prawne (typ: ${caseType}).

PISMO:
"""
${documentMd}
"""

Zwróć WYŁĄCZNIE JSON zgodnie z formatem z system prompt.`

  const raw = await callClaude({
    model,
    system: VALIDATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 1536,
    temperature: 0.2,
  })

  const parsed = extractJson(raw.text) as ValidationResult

  if (typeof parsed.score !== 'number') {
    throw new AnthropicError('Walidacja: brak score w odpowiedzi')
  }
  if (typeof parsed.passed !== 'boolean') {
    parsed.passed = !parsed.issues?.some((i) => i.severity === 'error')
  }

  return {
    data: parsed,
    raw,
    model,
    costUsd: calcCostUsd(model, raw.usage),
  }
}
