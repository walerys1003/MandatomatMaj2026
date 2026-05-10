import { Spinner } from '@mandatomat/ui'

/**
 * Loading UI dla /sprawy — lista spraw użytkownika.
 */
export default function SprawyLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner size={32} />
        <p className="text-sm text-iron-600 dark:text-iron-400">Ładujemy Twoje sprawy…</p>
      </div>
    </div>
  )
}
