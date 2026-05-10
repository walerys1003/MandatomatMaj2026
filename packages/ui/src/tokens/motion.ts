/**
 * Motion tokens — Mandatomat.
 *
 * Source: D10_animacje_dark_responsive.
 *
 * Mandatomat ma NAJSZYBSZE animacje w całym ekosystemie LexMate24.
 * Duration bazowy 150ms (vs. 200ms Długomat, 300ms Alimentomat, 400ms Rozwodomat).
 * Ease: snap — natychmiastowy start, szybkie zakończenie.
 * Wrażenie: KLIK — gotowe. Zero czekania. Maszyna.
 */

export const duration = {
  instant: '80ms', // button click scale
  snap: '150ms', // domyślny
  page: '200ms',
  modal: '250ms',
} as const

export const easing = {
  snap: 'cubic-bezier(0.12, 0.8, 0.3, 1)',
  smoothOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  linear: 'linear',
} as const

export const motion = {
  // Card hover — translateY 0→(-1px), shadow sm→md, 150ms
  cardHover: `transform ${duration.snap} ${easing.snap}, box-shadow ${duration.snap} ${easing.snap}, border-color ${duration.snap} ${easing.snap}`,
  // Button click — scale 1→0.98→1, 80ms
  buttonClick: `transform ${duration.instant} ${easing.snap}`,
  // Page transition — opacity only, brak translateY
  page: `opacity ${duration.page} ${easing.snap}`,
  // Wizard step — crossfade only, brak slide
  wizardStep: `opacity ${duration.snap} ${easing.snap}`,
} as const
