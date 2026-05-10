import { Spinner } from '@mandatomat/ui'

/**
 * Loading UI dla wszystkich podstron /admin/*.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner size={36} />
        <p className="text-sm text-iron-600 dark:text-iron-400">Ładujemy panel administracyjny…</p>
      </div>
    </div>
  )
}
