'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button } from '@mandatomat/ui'

import {
  adminAddCaseNoteAction,
  adminArchiveCaseAction,
  adminUpdateCaseStatusAction,
  type AdminActionState,
} from './_actions'

const STATUSES = [
  'draft',
  'form_completed',
  'generating',
  'preview',
  'editing',
  'payment_pending',
  'paid',
  'downloaded',
  'sent',
  'waiting',
  'resolved',
  'archived',
] as const

const initial: AdminActionState = { ok: false }

interface Props {
  caseId: string
  currentStatus: string
}

function PendingButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Zapisywanie…' : children}
    </Button>
  )
}

export function CaseAdminControls({ caseId, currentStatus }: Props): JSX.Element {
  const [statusState, statusAction] = useFormState(adminUpdateCaseStatusAction, initial)
  const [archiveState, archiveAction] = useFormState(adminArchiveCaseAction, initial)
  const [noteState, noteAction] = useFormState(adminAddCaseNoteAction, initial)

  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
      <header className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-amber-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-900 dark:bg-amber-900 dark:text-amber-100">
          Admin
        </span>
        <h2 className="font-display text-lg font-bold text-iron-950 dark:text-white">
          Akcje administracyjne
        </h2>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Zmiana statusu */}
        <form action={statusAction} className="space-y-2">
          <input type="hidden" name="caseId" value={caseId} />
          <label
            htmlFor={`status-${caseId}`}
            className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
          >
            Zmień status
          </label>
          <select
            id={`status-${caseId}`}
            name="status"
            defaultValue={currentStatus}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-800 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="reason"
            placeholder="Powód (opcjonalnie, max 500)"
            maxLength={500}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-xs text-iron-700 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
          />
          <PendingButton>Zapisz status</PendingButton>
          {statusState.error ? (
            <Alert variant="danger" title="Błąd">
              {statusState.error}
            </Alert>
          ) : null}
          {statusState.ok && statusState.message ? (
            <Alert variant="success" title="OK">
              {statusState.message}
            </Alert>
          ) : null}
        </form>

        {/* Archiwizacja */}
        <form action={archiveAction} className="space-y-2">
          <input type="hidden" name="caseId" value={caseId} />
          <label
            htmlFor={`archive-${caseId}`}
            className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
          >
            Archiwizuj sprawę
          </label>
          <input
            id={`archive-${caseId}`}
            type="text"
            name="reason"
            placeholder="Powód archiwizacji (wymagany, min. 3 znaki)"
            required
            minLength={3}
            maxLength={500}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-xs text-iron-700 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
          />
          <PendingButton>Archiwizuj</PendingButton>
          {archiveState.error ? (
            <Alert variant="danger" title="Błąd">
              {archiveState.error}
            </Alert>
          ) : null}
          {archiveState.ok && archiveState.message ? (
            <Alert variant="success" title="OK">
              {archiveState.message}
            </Alert>
          ) : null}
        </form>
      </div>

      {/* Notatka admina */}
      <form action={noteAction} className="mt-6 space-y-2">
        <input type="hidden" name="caseId" value={caseId} />
        <label
          htmlFor={`note-${caseId}`}
          className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
        >
          Notatka admina (zapisana w admin_logs)
        </label>
        <textarea
          id={`note-${caseId}`}
          name="note"
          rows={2}
          maxLength={2000}
          required
          placeholder="Np. 'Klient potwierdził telefonicznie wysłanie odwołania pocztą poleconą.'"
          className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-700 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
        />
        <PendingButton>Dodaj notatkę</PendingButton>
        {noteState.error ? (
          <Alert variant="danger" title="Błąd">
            {noteState.error}
          </Alert>
        ) : null}
        {noteState.ok && noteState.message ? (
          <Alert variant="success" title="OK">
            {noteState.message}
          </Alert>
        ) : null}
      </form>
    </section>
  )
}
