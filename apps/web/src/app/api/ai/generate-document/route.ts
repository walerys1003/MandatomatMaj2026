import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import {
  AnthropicError,
  generateDocument,
  hasPrompt,
  letterResponseSchema,
  loadPrompt,
  validateDocument,
  type PromptInput,
} from '@/lib/ai'
import { letterToMarkdown } from '@/lib/ai/letter-to-markdown'
import { caseTypeFromDb } from '@/lib/cases/db-mapping'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/ai/generate-document
 *
 * Pipeline:
 *  1. Auth (wymagane logowanie + sprawa należy do usera)
 *  2. Rate limit (bucket 'ai': 30/min/user)
 *  3. Idempotency — header `Idempotency-Key` (opcjonalny ale zalecany).
 *     Jeśli był już insert dla tej pary (case_id, key) → zwracamy stary dokument.
 *  4. Load prompt → Claude Sonnet → extractJson + Zod walidacja
 *  5. Render Markdown
 *  6. Insert do `documents` (doc_type='draft_markdown')
 *  7. (background) Walidacja Haiku — wynik UPDATE-uje doc.score + validation_passed
 *
 * Status sprawy: draft → generating (przed Claude) → preview (po sukcesie)
 *                                                  → failed (przy błędzie)
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel: do 60s dla pro plan

const bodySchema = z.object({
  caseId: z.string().uuid(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  // Rate limit
  const rl = await rateLimit(`user:${user.id}`, 'ai')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.', retryAfter: rl.reset },
      { status: 429, headers },
    )
  }

  // Body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400, headers })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Walidacja nieudana', issues: parsed.error.issues },
      { status: 400, headers },
    )
  }

  const { caseId } = parsed.data

  // Idempotency
  const idempotencyKey = req.headers.get('idempotency-key')

  // Load case + profile
  const [caseRes, profileRes] = await Promise.all([
    supabase
      .from('cases')
      .select('id, user_id, case_type, category, title, status, form_data')
      .eq('id', caseId)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, address_street, address_city, address_postal_code')
      .eq('id', user.id)
      .single(),
  ])

  if (caseRes.error || !caseRes.data) {
    return NextResponse.json({ error: 'Sprawa nie znaleziona' }, { status: 404, headers })
  }

  const caseData = caseRes.data
  const profile = profileRes.data

  // Idempotency check — jeśli już istnieje dokument z tym kluczem
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('documents')
      .select('id, content_markdown, ai_model_used, ai_cost_usd')
      .eq('case_id', caseId)
      .eq('ai_prompt_version', `idempotency:${idempotencyKey}`)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          document: existing,
          idempotent: true,
        },
        { status: 200, headers },
      )
    }
  }

  // Map DB enum → TS CaseType
  const tsType = caseTypeFromDb(caseData.case_type)
  if (!tsType || !hasPrompt(tsType)) {
    return NextResponse.json(
      { error: 'Brak prompta dla tego typu sprawy. Wkrótce dodamy!' },
      { status: 501, headers },
    )
  }

  // Build prompt input — używamy form_data + dane wnoszącego
  const formData = (caseData.form_data ?? {}) as Record<string, unknown>
  const petitionerName = profile?.full_name ?? '_______________'
  const petitionerAddress = [
    profile?.address_street,
    [profile?.address_postal_code, profile?.address_city].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ') || '_______________'

  const promptInput = buildPromptInput(tsType, formData, petitionerName, petitionerAddress)
  if (!promptInput) {
    return NextResponse.json(
      { error: 'Nie udało się przygotować prompta dla tej sprawy' },
      { status: 500, headers },
    )
  }

  // Update case status → generating
  await supabase.from('cases').update({ status: 'generating' }).eq('id', caseId)

  try {
    const loaded = loadPrompt(promptInput)

    const result = await generateDocument({
      systemPrompt: loaded.systemPrompt,
      userPrompt: loaded.userPrompt,
      model: loaded.preferredModel,
      maxTokens: loaded.maxTokens,
    })

    // Walidacja Zod — Claude może zwrócić niepoprawny JSON
    const zParsed = letterResponseSchema.safeParse(result.data)
    if (!zParsed.success) {
      console.error('[generate-document] Zod failed:', zParsed.error.issues)
      await supabase.from('cases').update({ status: 'failed' }).eq('id', caseId)
      return NextResponse.json(
        {
          error: 'AI wygenerował pismo w nieprawidłowym formacie. Spróbuj ponownie.',
          issues: zParsed.error.issues.slice(0, 3).map((i) => i.message),
        },
        { status: 502, headers },
      )
    }

    const letter = zParsed.data

    // Render Markdown
    const today = new Date().toISOString().split('T')[0]!
    const markdown = letterToMarkdown(letter, {
      petitionerName,
      petitionerAddress,
      city: typeof formData['miejsce_zdarzenia'] === 'string'
        ? extractCity(formData['miejsce_zdarzenia'])
        : undefined,
      date: today,
    })

    // Insert dokumentu
    const { data: doc, error: insertErr } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        user_id: user.id,
        doc_type: 'draft_markdown',
        title: letter.tytul,
        content_markdown: markdown,
        version: 1,
        is_current: true,
        ai_model_used: result.model,
        ai_prompt_version: idempotencyKey
          ? `idempotency:${idempotencyKey}`
          : `${tsType}:v1`,
        ai_tokens_input: result.raw.usage.input_tokens,
        ai_tokens_output: result.raw.usage.output_tokens,
        ai_cost_usd: result.costUsd,
      })
      .select('id, doc_type, title, content_markdown, ai_cost_usd, created_at')
      .single()

    if (insertErr) {
      console.error('[generate-document] Insert error:', insertErr)
      await supabase.from('cases').update({ status: 'failed' }).eq('id', caseId)
      return NextResponse.json(
        { error: 'Nie udało się zapisać dokumentu' },
        { status: 500, headers },
      )
    }

    // Status sprawy → preview, scoring_result zapisz
    await supabase
      .from('cases')
      .update({
        status: 'preview',
        scoring_result: {
          score: letter.scoring_szans,
          reasoning: letter.uzasadnienie_scoringu,
          warnings: letter.ostrzezenia,
          generated_at: new Date().toISOString(),
        },
      })
      .eq('id', caseId)

    // Walidacja Haiku — w tle (nie blokujemy odpowiedzi)
    void runValidationInBackground(supabase, doc.id, markdown, tsType)

    // Telemetria
    void supabase.from('events').insert({
      user_id: user.id,
      event_name: 'document_generated',
      metadata: {
        case_id: caseId,
        case_type: tsType,
        document_id: doc.id,
        scoring: letter.scoring_szans,
        model: result.model,
        cost_usd: result.costUsd,
        tokens: result.raw.usage,
      },
    })

    return NextResponse.json(
      {
        document: doc,
        scoring: {
          score: letter.scoring_szans,
          reasoning: letter.uzasadnienie_scoringu,
          warnings: letter.ostrzezenia,
        },
      },
      { status: 200, headers },
    )
  } catch (e) {
    await supabase.from('cases').update({ status: 'failed' }).eq('id', caseId)

    if (e instanceof AnthropicError) {
      console.error('[generate-document] Anthropic error:', e.message, e.status)
      return NextResponse.json(
        { error: 'AI nie odpowiedział poprawnie. Spróbuj ponownie za chwilę.' },
        { status: e.status && e.status >= 500 ? 502 : 400, headers },
      )
    }
    console.error('[generate-document] Unexpected error:', e)
    return NextResponse.json(
      { error: 'Błąd serwera. Spróbuj ponownie.' },
      { status: 500, headers },
    )
  }
}

// ============================================================================
// Helpers
// ============================================================================

/** Próbuje wyciągnąć miasto z pola "miejsce_zdarzenia" (np. "Warszawa, ul. ..."). */
function extractCity(place: string): string | undefined {
  const trimmed = place.trim()
  if (!trimmed) return undefined
  const beforeComma = trimmed.split(',')[0]?.trim()
  return beforeComma && beforeComma.length > 0 ? beforeComma : undefined
}

/**
 * Mapowanie form_data → typowane PromptInput per case_type.
 *
 * Pola wymagane przez prompty są wyciągane z form_data; te których brak
 * zostają jako null/empty (prompty obsługują "brak danych").
 */
function buildPromptInput(
  caseType: string,
  fd: Record<string, unknown>,
  petitionerName: string,
  petitionerAddress: string,
): PromptInput | null {
  const s = (k: string): string => (typeof fd[k] === 'string' ? (fd[k] as string) : '')
  const ns = (k: string): string | null => {
    const v = fd[k]
    return typeof v === 'string' && v.length > 0 ? v : null
  }
  const n = (k: string): number | null => {
    const v = fd[k]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v !== '') {
      const num = Number(v)
      return Number.isFinite(num) ? num : null
    }
    return null
  }
  const b = (k: string): boolean | null => {
    const v = fd[k]
    if (typeof v === 'boolean') return v
    return null
  }

  switch (caseType) {
    case 'M1_mandat_predkosc':
      return {
        caseType: 'M1_mandat_predkosc',
        data: {
          numer_mandatu: s('numer_mandatu'),
          data_zdarzenia: s('data_zdarzenia'),
          miejsce_zdarzenia: s('miejsce_zdarzenia'),
          organ: s('organ'),
          kwota_mandatu: n('kwota_mandatu') ?? 0,
          punkty_karne: n('punkty_karne'),
          predkosc_zmierzona: n('predkosc_zmierzona'),
          predkosc_dozwolona: n('predkosc_dozwolona'),
          rodzaj_pomiaru: (s('urzadzenie_pomiarowe') || 'inne') as never,
          swiadectwo_wzorcowania_aktualne: b('swiadectwo_wzorcowania_aktualne'),
          znak_byl_widoczny: b('znak_byl_widoczny'),
          byl_pan_kierowca: b('byl_pan_kierowca') ?? true,
          okolicznosci_dodatkowe: ns('opis_okolicznosci') ?? ns('opis_dodatkowy'),
          imie_nazwisko: petitionerName,
          pesel_zaszyfrowany: '[PESEL]',
          adres: petitionerAddress,
        },
      }

    case 'M4_mandat_pasy':
      return {
        caseType: 'M4_mandat_pasy',
        data: {
          numer_mandatu: s('numer_mandatu'),
          data_zdarzenia: s('data_zdarzenia'),
          miejsce_zdarzenia: s('miejsce_zdarzenia'),
          nazwa_strazy: s('nazwa_strazy'),
          kwota_mandatu: n('kwota_mandatu') ?? 0,
          rodzaj_wykroczenia: (s('rodzaj_wykroczenia') || 'inne') as never,
          powod_odwolania: s('powod_odwolania'),
          opis_okolicznosci: ns('opis_okolicznosci'),
          opis_dodatkowy: ns('opis_dodatkowy'),
          czy_otrzymal_zdjecie: b('czy_otrzymal_zdjecie'),
          imie_nazwisko: petitionerName,
          adres: petitionerAddress,
        },
      }

    case 'P1_parking_strefa_platna':
      return {
        caseType: 'P1_parking_strefa_platna',
        data: {
          numer_wezwania: s('numer_wezwania'),
          data_zdarzenia: s('data_zdarzenia'),
          godzina_zdarzenia: ns('godzina_zdarzenia'),
          miejsce_zdarzenia: s('miejsce_zdarzenia'),
          numer_rejestracyjny: s('numer_rejestracyjny'),
          zarzadca_strefy: s('zarzadca_strefy'),
          kwota_oplaty: n('kwota_oplaty') ?? 0,
          powod_reklamacji: s('powod_reklamacji'),
          numer_biletu: ns('numer_biletu'),
          godzina_oplacenia: ns('godzina_oplacenia'),
          numer_karty_parkingowej: ns('numer_karty_parkingowej'),
          opis_okolicznosci: ns('opis_okolicznosci'),
          ma_dowody: b('ma_dowody'),
          imie_nazwisko: petitionerName,
          adres: petitionerAddress,
        },
      }

    case 'P3_parking_oplata_dodatkowa':
      return {
        caseType: 'P3_parking_oplata_dodatkowa',
        data: {
          numer_wezwania: s('numer_wezwania'),
          data_zdarzenia: s('data_zdarzenia'),
          przewoznik: s('przewoznik'),
          linia_pojazd: ns('linia_pojazd'),
          miejsce_zdarzenia: ns('miejsce_zdarzenia'),
          kwota_oplaty: n('kwota_oplaty') ?? 0,
          numer_kontrolera: ns('numer_kontrolera'),
          powod_odwolania: s('powod_odwolania'),
          numer_biletu: ns('numer_biletu'),
          rodzaj_ulgi: ns('rodzaj_ulgi'),
          opis_okolicznosci: ns('opis_okolicznosci'),
          opis_dodatkowy: ns('opis_dodatkowy'),
          ma_dowody: b('ma_dowody'),
          imie_nazwisko: petitionerName,
          adres: petitionerAddress,
        },
      }

    case 'W1_windykacja_przedawnienie':
      return {
        caseType: 'W1_windykacja_przedawnienie',
        data: {
          wierzyciel: s('wierzyciel'),
          pierwotny_wierzyciel: ns('pierwotny_wierzyciel'),
          numer_sprawy: s('numer_sprawy'),
          data_wezwania: s('data_wezwania'),
          kwota_zadania: n('kwota_zadania') ?? 0,
          rodzaj_zobowiazania: s('rodzaj_zobowiazania'),
          data_wymagalnosci: s('data_wymagalnosci'),
          data_ostatniej_platnosci: ns('data_ostatniej_platnosci'),
          czy_uznano_dlug: (s('czy_uznano_dlug') || 'nie_pamietam') as never,
          czy_byl_pozew: (s('czy_byl_pozew') || 'nie_wiem') as never,
          kwestionuje_dlug: Array.isArray(fd['kwestionuje_dlug'])
            ? (fd['kwestionuje_dlug'] as string[])
            : null,
          opis_dodatkowy: ns('opis_dodatkowy'),
          imie_nazwisko: petitionerName,
          adres: petitionerAddress,
          data_pisma: new Date().toISOString().split('T')[0]!,
        },
      }

    default:
      return null
  }
}

/** Walidacja Haiku w tle — UPDATE-uje doc.score + validation_passed. */
async function runValidationInBackground(
  supabase: ReturnType<typeof createClient>,
  documentId: string,
  markdown: string,
  caseType: string,
): Promise<void> {
  try {
    const v = await validateDocument(markdown, caseType)
    await supabase
      .from('documents')
      .update({
        score: v.data.score,
        validation_passed: v.data.passed,
        validation_issues: v.data.issues,
      })
      .eq('id', documentId)
  } catch (e) {
    console.warn('[generate-document] Background validation failed:', e)
  }
}
