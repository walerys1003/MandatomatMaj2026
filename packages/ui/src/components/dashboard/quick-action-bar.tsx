import Link from 'next/link'

import { cn } from '../../lib/cn'

/**
 * <QuickActionBar> — 5 buttonów shortcut.
 *
 * Chunk D08:
 *  - Nowy mandat / Fotoradar / Parking / ZTM / Inne
 *  - layout: horizontal scroll na mobile, grid 5-col desktop
 */

export interface QuickAction {
  label: string
  href: string
  icon: string
  description?: string
}

export interface QuickActionBarProps {
  actions?: QuickAction[]
  className?: string
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'Mandat', icon: '🚓', href: '/sprawy/nowa/mandat/M1_mandat_predkosc', description: 'Sprzeciw od mandatu' },
  { label: 'Fotoradar', icon: '📸', href: '/sprawy/nowa/wezwanie/W1_wezwanie_predkosc', description: 'Odp. na wezwanie' },
  { label: 'Parking', icon: '🅿️', href: '/sprawy/nowa/parking/P1_parking_strefa', description: 'Odwołanie ZTM/SPP' },
  { label: 'Windykacja', icon: '⚖️', href: '/sprawy/nowa/windykacja/U1_windykacja', description: 'Sprzeciw od windykacji' },
  { label: 'Inne', icon: '➕', href: '/sprawy/nowa', description: 'Wybierz typ pisma' },
]

export function QuickActionBar({ actions = DEFAULT_ACTIONS, className }: QuickActionBarProps) {
  return (
    <nav
      aria-label="Szybkie akcje"
      className={cn(
        'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5',
        className,
      )}
    >
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="group flex flex-col items-center gap-1.5 rounded-lg border border-iron-200 bg-white px-3 py-4 text-center transition hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm dark:border-iron-700 dark:bg-iron-900 dark:hover:border-brand-600 dark:hover:bg-brand-950/40"
        >
          <span aria-hidden className="text-2xl">
            {a.icon}
          </span>
          <span className="text-sm font-medium text-iron-800 group-hover:text-brand-700 dark:text-iron-200 dark:group-hover:text-brand-300">
            {a.label}
          </span>
          {a.description ? (
            <span className="hidden text-[11px] text-iron-500 sm:block dark:text-iron-400">
              {a.description}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  )
}
