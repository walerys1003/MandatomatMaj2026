import { Spinner } from '@mandatomat/ui'

/**
 * Loading UI dla /panel — wyświetlana podczas ładowania server component.
 *
 * D10 zgodnie ze specyfikacją: brak skeleton shimmer; tylko spinner z opisem.
 */
export default function PanelLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner size={36} />
        <p className="text-sm text-iron-600 dark:text-iron-400">Ładujemy Twój panel…</p>
      </div>
    </div>
  )
}
