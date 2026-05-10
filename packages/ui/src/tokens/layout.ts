/**
 * Layout / spacing / radius / shadow tokens — Mandatomat.
 *
 * Source: D02_typografia_layout, D10_animacje_dark_responsive.
 *
 * Mandatomat jest GĘSTSZY od innych SaaS-ów. Mniej whitespace, więcej danych,
 * bliżej do siebie. To nie blog — to narzędzie. Bloomberg, nie Medium.
 */

export const containers = {
  landing: '1320px', // najszerszy — więcej treści
  dashboard: '1140px',
  wizard: '560px', // najwęższy — krótkie formularze
  prose: '480px',
} as const

export const spacing = {
  // Sekcje landing: padding-y 100px (najkrótszy padding)
  sectionY: '100px',
  // Karty: padding 24px, gap 16px
  cardPadding: '24px',
  cardGap: '16px',
  fieldGap: '16px',
} as const

export const radius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px', // domyślny radius Mandatomatu
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const

/**
 * Cienie ostrożne — Mandatomat ma SUBTLE shadows. Hover unosi kartę o 1px,
 * nie 3px (gęsty UI z wieloma kartami).
 */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(9, 9, 11, 0.04)',
  DEFAULT: '0 1px 3px 0 rgba(9, 9, 11, 0.06), 0 1px 2px -1px rgba(9, 9, 11, 0.04)',
  md: '0 4px 6px -1px rgba(9, 9, 11, 0.06), 0 2px 4px -2px rgba(9, 9, 11, 0.04)',
  lg: '0 10px 15px -3px rgba(9, 9, 11, 0.08), 0 4px 6px -4px rgba(9, 9, 11, 0.04)',
  ring: '0 0 0 3px rgba(37, 99, 235, 0.18)', // focus ring (precision blue 600 @ 18%)
} as const
