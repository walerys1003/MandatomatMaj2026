import { z } from 'zod'

/**
 * Schema walidacji odpowiedzi Claude'a — używana po sparsowaniu JSON-a z modelu.
 *
 * Jeśli Claude odda strukturę nieprzewidzianą — odrzucamy i ponawiamy z bardziej
 * restrykcyjnym promptem (retry logic w `apps/web/src/lib/ai/generate-letter.ts`,
 * Tier 3).
 */

export const podstawaPrawnaSchema = z.object({
  akt: z.enum(['KW', 'KPSW', 'KPA', 'PoRD', 'KC', 'Konstytucja', 'Rozporzadzenie', 'inne']),
  artykul: z.string().min(1).max(40),
  tresc_skrocona: z.string().min(5).max(300),
})

export const argumentSchema = z.object({
  punkt: z.number().int().positive().max(20),
  naglowek: z.string().min(3).max(120),
  tresc: z.string().min(20).max(2000),
  podstawa: z.string().min(3).max(120),
})

export const letterResponseSchema = z.object({
  tytul: z.string().min(5).max(200),
  do_organu: z.string().min(3).max(200),
  podstawy_prawne: z.array(podstawaPrawnaSchema).min(1).max(10),
  argumentacja: z.array(argumentSchema).min(1).max(8),
  wnioski: z.array(z.string().min(3).max(300)).min(1).max(6),
  uzasadnienie_scoringu: z.string().min(10).max(800),
  scoring_szans: z.number().min(0).max(1),
  ostrzezenia: z.array(z.string().min(3).max(500)).default([]),
})

export type LetterResponse = z.infer<typeof letterResponseSchema>

/**
 * Mapowanie scoringu na ludzką etykietę dla UI.
 */
export function scoringLabel(score: number): {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'default'
  emoji: string
} {
  if (score >= 0.75) {
    return { label: 'Wysokie szanse', variant: 'success', emoji: '✅' }
  }
  if (score >= 0.5) {
    return { label: 'Umiarkowane szanse', variant: 'default', emoji: '🤞' }
  }
  if (score >= 0.3) {
    return { label: 'Niskie szanse', variant: 'warning', emoji: '⚠️' }
  }
  return { label: 'Bardzo niskie szanse', variant: 'danger', emoji: '⛔' }
}
