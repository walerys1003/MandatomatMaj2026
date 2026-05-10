import { Spinner } from '@mandatomat/ui'

/**
 * Loading UI dla /terminy — kalendarz + lista terminów.
 */
export default function TerminyLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner size={32} />
        <p className="text-sm text-iron-600 dark:text-iron-400">Wczytujemy kalendarz terminów…</p>
      </div>
    </div>
  )
}
