/**
 * A/B testing engine — server-side assignment, deterministyczny per user/anon.
 *
 * Task: T6-ONB-001 (landing hero A/B) — fundament dla T9-EXP-041..050.
 *
 * Strategia:
 *  - Każdy eksperyment ma `key`, listę `variants` z `weight`.
 *  - Assignment: hash(userId|anonId + experimentKey) % 100 → variant bucket.
 *  - Deterministyczny: ten sam user zawsze widzi ten sam variant w obrębie eksperymentu.
 *  - Bez DB write na każdy hit (eksperymenty live w kodzie + Plausible tracking).
 *  - Holdout group (T9-EXP-045): 5% userów zawsze widzi `control`.
 *
 * Edge-compatible — czysty fetch + Web Crypto.
 */

export interface Variant {
  /** ID variantu, np. "control", "variant-a" */
  id: string
  /** Waga 0-100, sumarycznie ≤ 100 (rest = holdout). */
  weight: number
  /** Opis dla admin UI / Plausible dashboard. */
  label?: string
}

export interface Experiment {
  /** Klucz eksperymentu, np. "landing-hero-2026-05". */
  key: string
  /** Czy aktywny — można wyłączyć bez deploya (TODO: DB-driven). */
  enabled: boolean
  /** Lista wariantów. Pierwszy = control. */
  variants: Variant[]
  /** Procent userów w eternal holdout (zawsze control). Default 5. */
  holdoutPercent?: number
  /** Hipoteza dla `docs/experiments/*.md`. */
  hypothesis?: string
}

/**
 * Rejestr eksperymentów aktywnych w aplikacji.
 * Każdy nowy eksperyment dodajesz tutaj — TypeScript wymusi pokrycie wariantów.
 */
export const EXPERIMENTS = {
  'landing-hero-2026-05': {
    key: 'landing-hero-2026-05',
    enabled: true,
    holdoutPercent: 5,
    variants: [
      { id: 'control', weight: 50, label: 'Bez prawnika w 5 minut' },
      { id: 'variant-a', weight: 45, label: 'Sprawdź szanse za darmo' },
    ],
    hypothesis: 'Hero z bezpośrednim CTA do free scoring zwiększy signup rate o 15% (p<0.05)',
  },
  'pricing-tiers-2026-05': {
    key: 'pricing-tiers-2026-05',
    enabled: true,
    holdoutPercent: 5,
    variants: [
      { id: 'control', weight: 50, label: '2 plany: Free + Pro' },
      { id: 'variant-a', weight: 45, label: '3 plany: Free + Standard + Pro' },
    ],
    hypothesis: '3-tier pricing zwiększy ARPU o 20% przy zachowaniu conversion',
  },
} as const satisfies Record<string, Experiment>

export type ExperimentKey = keyof typeof EXPERIMENTS

/**
 * Deterministyczny hash userId+experimentKey → 0-99.
 *
 * Używa Web Crypto (Edge-compatible). Bierze pierwsze 4 bajty SHA-256.
 */
async function bucketOf(seed: string, experimentKey: string): Promise<number> {
  const data = new TextEncoder().encode(`${seed}:${experimentKey}`)
  const hashBuf = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hashBuf)
  // Pierwsze 4 bajty → uint32 → modulo 100
  const n = (bytes[0]! << 24) | (bytes[1]! << 16) | (bytes[2]! << 8) | bytes[3]!
  // Unsigned shift
  return (n >>> 0) % 100
}

/**
 * Server-side assignment do wariantu.
 *
 * @param experimentKey - klucz eksperymentu
 * @param seed - userId (auth) lub anonId (cookie) - decyduje o stabilności
 * @returns id wariantu (lub "control" gdy disabled/holdout/unknown)
 */
export async function assignVariant(experimentKey: ExperimentKey, seed: string): Promise<string> {
  const exp = EXPERIMENTS[experimentKey]
  if (!exp || !exp.enabled) return 'control'

  const bucket = await bucketOf(seed, experimentKey)
  const holdout = exp.holdoutPercent ?? 5

  // Holdout group — eternal control (zawsze ostatnie 5% bucketów)
  if (bucket >= 100 - holdout) return 'control'

  // Przydzielenie do wariantu wg wag (skala 0..100-holdout)
  const available = 100 - holdout
  let cumulative = 0
  for (const v of exp.variants) {
    cumulative += v.weight
    // Skalujemy weight do dostępnej puli
    const scaledThreshold = (cumulative / 100) * available
    if (bucket < scaledThreshold) return v.id
  }

  return exp.variants[0]?.id ?? 'control'
}

/**
 * Synchroniczny fallback dla SSR z istniejącym cookie bucket
 * (np. middleware już policzyło hash i zapisało).
 */
export function assignVariantSync(experimentKey: ExperimentKey, bucket: number): string {
  const exp = EXPERIMENTS[experimentKey]
  if (!exp || !exp.enabled) return 'control'

  const holdout = exp.holdoutPercent ?? 5
  if (bucket >= 100 - holdout) return 'control'

  const available = 100 - holdout
  let cumulative = 0
  for (const v of exp.variants) {
    cumulative += v.weight
    const scaledThreshold = (cumulative / 100) * available
    if (bucket < scaledThreshold) return v.id
  }
  return exp.variants[0]?.id ?? 'control'
}
