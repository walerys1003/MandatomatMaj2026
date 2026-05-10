import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * <CrossSellBanner> — banner promujący siostrzane produkty ekosystemu.
 *
 * Roadmap T20 / Faza 9: "Cross-sell banner do Długomatu/Alimentomatu".
 *
 * Kontekst biznesowy (T01):
 *   - Mandatomat = bramka wejściowa (najniższa cena: 19-79 zł)
 *   - Długomat = windykacja (sprzeciwy od nakazów zapłaty, przedawnienia, EPU)
 *   - Alimentomat = alimenty (cross-sellowany dla persona "rodzic w trakcie rozwodu")
 *
 * Reguły prezentacji (D04):
 *   - Długomat: navy palette (navy-100 bg, navy-700 text)
 *   - Alimentomat: indigo palette
 *   - Klik → external redirect (`/dlugomat`, `/alimentomat` — w przyszłości
 *     prawdziwe domeny dlugomat.pl / alimentomat.pl)
 *   - Banner pojawia się PO sukcesie (np. po pobraniu pisma) lub w katalogu
 *     dla kategorii nieobsługiwanej przez Mandatomat
 *
 * Warianty:
 *   - dlugomat (navy) — windykacja, sprzeciwy, KRUK/EOS/Intrum
 *   - alimentomat (indigo) — alimenty, opieka nad dziećmi
 *   - generic (precision-blue) — fallback do mixed/multiple
 */

export type CrossSellProduct = 'dlugomat' | 'alimentomat' | 'generic'

export interface CrossSellBannerProps {
  product: CrossSellProduct
  /** Override tytułu (jeśli chcesz spersonalizować). */
  title?: string
  /** Override opisu. */
  description?: string
  /** Override CTA label. */
  ctaLabel?: string
  /** Override URL (default: '/dlugomat' / '/alimentomat'). */
  href?: string
  /** Dodatkowy `?utm_source=mandatomat&utm_campaign=...` doklejany do href. */
  utmCampaign?: string
  /** Jeśli zewnętrzna domena (dlugomat.pl) — `target="_blank"`. */
  external?: boolean
  className?: string
}

interface ProductTheme {
  bg: string
  border: string
  pillBg: string
  pillText: string
  cta: string
  ctaHover: string
  emoji: string
  defaultTitle: string
  defaultDescription: string
  defaultCtaLabel: string
  defaultHref: string
}

const THEMES: Record<CrossSellProduct, ProductTheme> = {
  dlugomat: {
    bg: 'bg-iron-900 dark:bg-iron-950',
    border: 'border-iron-800 dark:border-iron-700',
    pillBg: 'bg-iron-800 text-iron-100 dark:bg-iron-100 dark:text-iron-900',
    pillText: 'text-iron-200 dark:text-iron-300',
    cta: 'bg-white text-iron-950 hover:bg-iron-100',
    ctaHover: '',
    emoji: '⚖️',
    defaultTitle: 'Masz nakaz zapłaty? Sprzeciw to Długomat.',
    defaultDescription:
      'Sprzeciwy od nakazów zapłaty (EPU), przedawnienia długów, odpowiedzi na pisma KRUK/EOS/Intrum. Druga sprawa od tej samej rodziny — bez ponownej rejestracji.',
    defaultCtaLabel: 'Sprawdź Długomat →',
    defaultHref: '/dlugomat',
  },
  alimentomat: {
    bg: 'bg-precision-blue-950 dark:bg-precision-blue-950',
    border: 'border-precision-blue-800 dark:border-precision-blue-700',
    pillBg:
      'bg-precision-blue-700 text-white dark:bg-precision-blue-200 dark:text-precision-blue-950',
    pillText: 'text-precision-blue-200 dark:text-precision-blue-200',
    cta: 'bg-white text-precision-blue-950 hover:bg-precision-blue-50',
    ctaHover: '',
    emoji: '👨‍👩‍👧',
    defaultTitle: 'Sprawy alimentacyjne? To Alimentomat.',
    defaultDescription:
      'Pozew o alimenty, podwyższenie alimentów, ograniczenie/pozbawienie władzy rodzicielskiej. Od tych samych autorów co Mandatomat.',
    defaultCtaLabel: 'Sprawdź Alimentomat →',
    defaultHref: '/alimentomat',
  },
  generic: {
    bg: 'bg-precision-blue-50 dark:bg-precision-blue-950/50',
    border: 'border-precision-blue-200 dark:border-precision-blue-800',
    pillBg:
      'bg-precision-blue-100 text-precision-blue-700 dark:bg-precision-blue-900 dark:text-precision-blue-200',
    pillText: 'text-precision-blue-700 dark:text-precision-blue-300',
    cta: 'bg-precision-blue-600 text-white hover:bg-precision-blue-500',
    ctaHover: '',
    emoji: '✨',
    defaultTitle: 'Poznaj nasz ekosystem',
    defaultDescription:
      'Mandatomat to jedna z 4 platform LegalTech. Długomat, Alimentomat, Rozwodomat — każdy specjalizujący się w innym typie spraw.',
    defaultCtaLabel: 'Zobacz wszystkie →',
    defaultHref: '/produkty',
  },
}

export function CrossSellBanner({
  product,
  title,
  description,
  ctaLabel,
  href,
  utmCampaign,
  external,
  className,
}: CrossSellBannerProps): React.JSX.Element {
  const theme = THEMES[product]
  const isDarkBg = product === 'dlugomat' || product === 'alimentomat'
  const finalHref = href ?? theme.defaultHref

  const utmHref = utmCampaign
    ? `${finalHref}${finalHref.includes('?') ? '&' : '?'}utm_source=mandatomat&utm_medium=cross_sell&utm_campaign=${encodeURIComponent(utmCampaign)}`
    : finalHref

  return (
    <aside
      className={cn('rounded-xl border p-5 sm:p-6', theme.bg, theme.border, className)}
      aria-label={`Cross-sell: ${product}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* Pill z brandem */}
        <div
          className={cn(
            'inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-2xl',
            theme.pillBg,
          )}
          aria-hidden="true"
        >
          {theme.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn('font-mono text-[10px] uppercase tracking-wider', theme.pillText)}>
            Z TEJ SAMEJ RODZINY
          </p>
          <h3
            className={cn(
              'mt-1 font-display text-xl font-extrabold tracking-[-0.02em] sm:text-2xl',
              isDarkBg ? 'text-white' : 'text-iron-950 dark:text-white',
            )}
          >
            {title ?? theme.defaultTitle}
          </h3>
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed',
              isDarkBg ? 'text-iron-300' : 'text-iron-700 dark:text-iron-300',
            )}
          >
            {description ?? theme.defaultDescription}
          </p>
        </div>

        <a
          href={utmHref}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={cn(
            'inline-flex flex-none items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm',
            'transition-colors duration-150',
            theme.cta,
            'self-stretch sm:self-center',
          )}
        >
          {ctaLabel ?? theme.defaultCtaLabel}
        </a>
      </div>
    </aside>
  )
}
