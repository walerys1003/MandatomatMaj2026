'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { Alert, Button } from '@mandatomat/ui'

import {
  adminAddUserNoteAction,
  adminChangeUserPlanAction,
  adminChangeUserRoleAction,
  adminSoftDeleteUserAction,
  type AdminUserActionState,
} from './_actions'

const ROLES = ['user', 'moderator', 'admin'] as const
const PLANS = ['free', 'kierowca', 'pro', 'pro_plus'] as const

const initial: AdminUserActionState = { ok: false }

interface Props {
  userId: string
  currentRole: string | null
  currentPlan: string | null
  isDeleted: boolean
  isSelf: boolean
}

function PendingButton({
  children,
  variant,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'danger'
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant={variant ?? 'primary'} disabled={pending}>
      {pending ? 'Zapisywanie…' : children}
    </Button>
  )
}

export function UserAdminControls({
  userId,
  currentRole,
  currentPlan,
  isDeleted,
  isSelf,
}: Props): JSX.Element {
  const [roleState, roleAction] = useFormState(adminChangeUserRoleAction, initial)
  const [planState, planAction] = useFormState(adminChangeUserPlanAction, initial)
  const [deleteState, deleteAction] = useFormState(adminSoftDeleteUserAction, initial)
  const [noteState, noteAction] = useFormState(adminAddUserNoteAction, initial)

  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
      <header className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-amber-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-900 dark:bg-amber-900 dark:text-amber-100">
          Admin
        </span>
        <h2 className="font-display text-lg font-bold text-iron-950 dark:text-white">
          Akcje administracyjne
        </h2>
        {isSelf ? (
          <span className="ml-2 rounded-full bg-precision-blue-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-precision-blue-800 dark:bg-precision-blue-900 dark:text-precision-blue-200">
            to Twój profil
          </span>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rola */}
        <form action={roleAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`role-${userId}`}
            className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
          >
            Rola
          </label>
          <select
            id={`role-${userId}`}
            name="role"
            defaultValue={currentRole ?? 'user'}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-800 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="reason"
            placeholder="Powód (opcjonalnie)"
            maxLength={500}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-xs text-iron-700 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
          />
          <PendingButton>Zapisz rolę</PendingButton>
          {roleState.error ? (
            <Alert variant="danger" title="Błąd">
              {roleState.error}
            </Alert>
          ) : null}
          {roleState.ok && roleState.message ? (
            <Alert variant="success" title="OK">
              {roleState.message}
            </Alert>
          ) : null}
        </form>

        {/* Plan */}
        <form action={planAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`plan-${userId}`}
            className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
          >
            Plan / subskrypcja
          </label>
          <select
            id={`plan-${userId}`}
            name="plan"
            defaultValue={currentPlan ?? 'free'}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-iron-800 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-100"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="reason"
            placeholder="Powód (opcjonalnie)"
            maxLength={500}
            className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-xs text-iron-700 focus:border-precision-blue-500 focus:outline-none focus:ring-2 focus:ring-precision-blue-500/30 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
          />
          <PendingButton>Zapisz plan</PendingButton>
          {planState.error ? (
            <Alert variant="danger" title="Błąd">
              {planState.error}
            </Alert>
          ) : null}
          {planState.ok && planState.message ? (
            <Alert variant="success" title="OK">
              {planState.message}
            </Alert>
          ) : null}
        </form>
      </div>

      {/* Notatka admina */}
      <form action={noteAction} className="mt-6 space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <label
          htmlFor={`user-note-${userId}`}
          className="block font-mono text-[11px] uppercase tracking-wider text-iron-700 dark:text-iron-300"
        >
          Notatka admina (zapisana w admin_logs)
        </label>
        <textarea
          id={`user-note-${userId}`}
          name="note"
          rows={2}
          maxLength={2000}
          required
          placeholder="Np. 'Klient zgłosił duplikat konta — sprawdzono, oryginalne to user@example.com'"
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

      {/* Soft delete */}
      {!isDeleted && !isSelf ? (
        <form
          action={deleteAction}
          className="border-signal-300 dark:border-signal-800 dark:bg-signal-950/30 mt-6 space-y-2 rounded-md border bg-signal-50 p-4"
        >
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`delete-${userId}`}
            className="text-signal-800 dark:text-signal-300 block font-mono text-[11px] uppercase tracking-wider"
          >
            ⚠️ Soft-delete użytkownika
          </label>
          <p className="text-xs text-iron-700 dark:text-iron-300">
            Ustawia <code className="font-mono">deleted_at</code>. Konto pozostaje w bazie (audit +
            GDPR), ale user nie zaloguje się normalnie. Pełne usunięcie wymaga confirm flow z
            poziomu usera (<code>/api/profile/delete</code>).
          </p>
          <input
            id={`delete-${userId}`}
            type="text"
            name="reason"
            placeholder="Powód (wymagany, min. 3 znaki)"
            required
            minLength={3}
            maxLength={500}
            className="border-signal-300 dark:border-signal-800 w-full rounded-md border bg-white px-3 py-2 text-xs text-iron-700 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/30 dark:bg-iron-900 dark:text-iron-200"
          />
          <PendingButton variant="danger">Soft-delete</PendingButton>
          {deleteState.error ? (
            <Alert variant="danger" title="Błąd">
              {deleteState.error}
            </Alert>
          ) : null}
          {deleteState.ok && deleteState.message ? (
            <Alert variant="success" title="OK">
              {deleteState.message}
            </Alert>
          ) : null}
        </form>
      ) : null}
    </section>
  )
}
