'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { AdminGateError, logAdminAction, requireAdmin, type AdminUser } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Admin Server Actions dla `/admin/sprawy/[id]`.
 *
 * Każda mutacja:
 *   1. requireAdmin() — gating (defense in depth)
 *   2. fetch oldData (do logu)
 *   3. mutacja przez admin client (service-role, omija RLS)
 *   4. logAdminAction() do admin_logs
 *   5. revalidatePath() — odśwież cache widoku
 */

export interface AdminActionState {
  ok: boolean
  error?: string
  message?: string
}

const STATUS_VALUES = [
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

const updateStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(STATUS_VALUES),
  reason: z.string().trim().max(500).optional(),
})

const archiveSchema = z.object({
  caseId: z.string().uuid(),
  reason: z.string().trim().min(3, 'Podaj powód (min. 3 znaki).').max(500),
})

const noteSchema = z.object({
  caseId: z.string().uuid(),
  note: z.string().trim().min(1, 'Notatka nie może być pusta.').max(2000),
})

function gateError(err: unknown): AdminActionState {
  if (err instanceof AdminGateError) {
    return { ok: false, error: err.message }
  }
  return { ok: false, error: 'Wystąpił błąd serwera. Spróbuj ponownie.' }
}

/**
 * Zmiana statusu sprawy — np. ręczne przesunięcie do 'resolved'/'archived'
 * przez admina (np. po telefonicznym potwierdzeniu).
 */
export async function adminUpdateCaseStatusAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = updateStatusSchema.safeParse({
    caseId: formData.get('caseId'),
    status: formData.get('status'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'Walidacja nieudana.' }
  }

  const admin = createAdminClient()

  const { data: oldRow } = await admin
    .from('cases')
    .select('id, status, user_id, title')
    .eq('id', parsed.data.caseId)
    .maybeSingle()

  const oldTyped = oldRow as { id: string; status: string; user_id: string; title: string } | null
  if (!oldTyped) {
    return { ok: false, error: 'Sprawa nie istnieje.' }
  }

  if (oldTyped.status === parsed.data.status) {
    return { ok: true, message: 'Status bez zmian.' }
  }

  const { error: updErr } = await admin
    .from('cases')
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.caseId)

  if (updErr) {
    return { ok: false, error: 'Nie udało się zaktualizować statusu sprawy.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'update_case_status',
    targetType: 'case',
    targetId: parsed.data.caseId,
    oldData: { status: oldTyped.status },
    newData: {
      status: parsed.data.status,
      reason: parsed.data.reason ?? null,
      title: oldTyped.title,
      user_id: oldTyped.user_id,
    },
  })

  revalidatePath(`/admin/sprawy/${parsed.data.caseId}`)
  revalidatePath('/admin/sprawy')

  return { ok: true, message: `Status zmieniony na "${parsed.data.status}".` }
}

/**
 * Archiwizacja sprawy — soft delete (status='archived' + admin_logs).
 * Nie usuwa fizycznie z DB (audit trail + GDPR via /api/profile/delete).
 */
export async function adminArchiveCaseAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = archiveSchema.safeParse({
    caseId: formData.get('caseId'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Walidacja nieudana.',
    }
  }

  const admin = createAdminClient()

  const { data: oldRow } = await admin
    .from('cases')
    .select('id, status, user_id, title')
    .eq('id', parsed.data.caseId)
    .maybeSingle()

  const oldTyped = oldRow as { id: string; status: string; user_id: string; title: string } | null
  if (!oldTyped) {
    return { ok: false, error: 'Sprawa nie istnieje.' }
  }
  if (oldTyped.status === 'archived') {
    return { ok: true, message: 'Sprawa już zarchiwizowana.' }
  }

  const { error: updErr } = await admin
    .from('cases')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.caseId)

  if (updErr) {
    return { ok: false, error: 'Nie udało się zarchiwizować sprawy.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'archive_case',
    targetType: 'case',
    targetId: parsed.data.caseId,
    oldData: { status: oldTyped.status },
    newData: {
      status: 'archived',
      reason: parsed.data.reason,
      title: oldTyped.title,
      user_id: oldTyped.user_id,
    },
  })

  revalidatePath(`/admin/sprawy/${parsed.data.caseId}`)
  revalidatePath('/admin/sprawy')

  return { ok: true, message: 'Sprawa zarchiwizowana.' }
}

/**
 * Dodanie notatki admina do sprawy — zapisywane wyłącznie do admin_logs
 * (pod akcją 'admin_note'). Widoczne w `/admin/sprawy/[id]` w sekcji "Logi adminów".
 *
 * Notatki NIE są widoczne dla usera (RLS blokuje admin_logs).
 */
export async function adminAddCaseNoteAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = noteSchema.safeParse({
    caseId: formData.get('caseId'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Walidacja nieudana.',
    }
  }

  const admin = createAdminClient()

  // Verify case exists (FK constraint na admin_logs.target_id)
  const { data: caseRow } = await admin
    .from('cases')
    .select('id, user_id')
    .eq('id', parsed.data.caseId)
    .maybeSingle()

  if (!caseRow) {
    return { ok: false, error: 'Sprawa nie istnieje.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'admin_note',
    targetType: 'case',
    targetId: parsed.data.caseId,
    oldData: null,
    newData: {
      note: parsed.data.note,
      added_by_email: user.email,
      user_id: (caseRow as { user_id: string }).user_id,
    },
  })

  revalidatePath(`/admin/sprawy/${parsed.data.caseId}`)

  return { ok: true, message: 'Notatka zapisana w logach.' }
}
