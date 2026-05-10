/**
 * Typography tokens — Mandatomat.
 *
 * Source: D02_typografia_layout.
 *
 * Display: Inter Tight (zmodyfikowany Inter, tighter spacing, geometric).
 * Interface: Inter (więcej elementów weight 500 niż w innych SaaS-ach).
 * Mono: JetBrains Mono (numery spraw, kwoty, daty, tagi).
 *
 * Letter-spacing jest NAJBARDZIEJ NEGATYWNY ze wszystkich LexMate24 SaaS
 * (-0.04em w H1) — nagłówki "wygrawerowane w metalu".
 */

export const fontFamily = {
  display: 'var(--font-display, "Inter Tight"), Inter, system-ui, sans-serif',
  body: 'var(--font-body, "Inter"), system-ui, sans-serif',
  mono: 'var(--font-mono, "JetBrains Mono"), ui-monospace, monospace',
} as const

export const fontSize = {
  // Body
  xs: ['12px', { lineHeight: '1.5', letterSpacing: '0' }],
  sm: ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
  base: ['16px', { lineHeight: '1.6', letterSpacing: '0' }],
  lg: ['18px', { lineHeight: '1.6', letterSpacing: '-0.005em' }],
  // Display
  h4: ['18px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
  h3: ['24px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
  h2: ['36px', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
  h1: ['52px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '800' }],
} as const

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const
