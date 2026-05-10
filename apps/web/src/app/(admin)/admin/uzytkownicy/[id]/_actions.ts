'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { AdminGateError, logAdminAction, requireAdmin, type AdminUser } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Admin Server Actions dla `/admin/uzytkownicy/[id]`.
 *
 * Mutacje:
 *   - changeUserRole: zmiana roli (user / moderator / admin) — z self-protection
 *   - changeUserPlan: zmiana subscription_plan/tier (free / kierowca / pro)
 *   - softDeleteUser: ustawia profiles.deleted_at = now() (nie kasuje danych)
 *   - addAdminNote: notatka administratora w admin_logs
 *
 * Każda mutacja loguje się do admin_logs (target_type='user').
 */

export interface AdminUserActionState {
  ok: boolean
  error?: string
  message?: string
}

const ROLES = ['user', 'moderator', 'admin'] as const
const PLANS = ['free', 'kierowca', 'pro', 'pro_plus'] as const

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
  reason: z.string().trim().max(500).optional(),
})

const planSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(PLANS),
  reason: z.string().trim().max(500).optional(),
})

const softDeleteSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().trim().min(3, 'Podaj powód (min. 3 znaki).').max(500),
})

const noteSchema = z.object({
  userId: z.string().uuid(),
  note: z.string().trim().min(1, 'Notatka nie może być pusta.').max(2000),
})

function gateError(err: unknown): AdminUserActionState {
  if (err instanceof AdminGateError) {
    return { ok: false, error: err.message }
  }
  return { ok: false, error: 'Wystąpił błąd serwera. Spróbuj ponownie.' }
}

/**
 * Zmiana roli użytkownika (user / moderator / admin).
 *
 * Self-protection:
 *   - admin nie może odebrać sobie roli 'admin' (zabezpieczenie przed lockoutem)
 */
export async function adminChangeUserRoleAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = roleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'Walidacja nieudana.' }
  }

  // Self-demotion guard
  if (parsed.data.userId === user.userId && parsed.data.role !== 'admin') {
    return {
      ok: false,
      error: 'Nie możesz odebrać sobie uprawnień admina.',
    }
  }

  const admin = createAdminClient()

  const { data: oldRow } = await admin
    .from('profiles')
    .select('id, email, role, full_name')
    .eq('id', parsed.data.userId)
    .maybeSingle()

  const oldTyped = oldRow as {
    id: string
    email: string
    role: string | null
    full_name: string | null
  } | null
  if (!oldTyped) {
    return { ok: false, error: 'Użytkownik nie istnieje.' }
  }

  if (oldTyped.role === parsed.data.role) {
    return { ok: true, message: 'Rola bez zmian.' }
  }

  const { error: updErr } = await admin
    .from('profiles')
    .update({
      role: parsed.data.role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.userId)

  if (updErr) {
    return { ok: false, error: 'Nie udało się zaktualizować roli.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'change_user_role',
    targetType: 'user',
    targetId: parsed.data.userId,
    oldData: { role: oldTyped.role },
    newData: {
      role: parsed.data.role,
      reason: parsed.data.reason ?? null,
      target_email: oldTyped.email,
    },
  })

  revalidatePath(`/admin/uzytkownicy/${parsed.data.userId}`)
  revalidatePath('/admin/uzytkownicy')

  return { ok: true, message: `Rola zmieniona na "${parsed.data.role}".` }
}

/**
 * Zmiana planu/subskrypcji (free / kierowca / pro / pro_plus).
 * Aktualizuje BOTH `subscription_tier` (kanoniczne pole T20) oraz
 * starsze `subscription_plan` (compat dla istniejących query).
 */
export async function adminChangeUserPlanAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = planSchema.safeParse({
    userId: formData.get('userId'),
    plan: formData.get('plan'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'Walidacja nieudana.' }
  }

  const admin = createAdminClient()

  const { data: oldRow } = await admin
    .from('profiles')
    .select('id, email, subscription_tier, subscription_plan')
    .eq('id', parsed.data.userId)
    .maybeSingle()

  const oldTyped = oldRow as {
    id: string
    email: string
    subscription_tier: string | null
    subscription_plan: string | null
  } | null
  if (!oldTyped) {
    return { ok: false, error: 'Użytkownik nie istnieje.' }
  }

  const update: Record<string, unknown> = {
    subscription_tier: parsed.data.plan,
    subscription_plan: parsed.data.plan,
    updated_at: new Date().toISOString(),
  }

  // Manualna zmiana planu przez admina = traktujemy jako 'active' (jeśli != free)
  if (parsed.data.plan === 'free') {
    update['subscription_status'] = 'inactive'
  } else {
    update['subscription_status'] = 'active'
  }

  const { error: updErr } = await admin.from('profiles').update(update).eq('id', parsed.data.userId)

  if (updErr) {
    return { ok: false, error: 'Nie udało się zaktualizować planu.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'change_user_plan',
    targetType: 'user',
    targetId: parsed.data.userId,
    oldData: {
      subscription_tier: oldTyped.subscription_tier,
      subscription_plan: oldTyped.subscription_plan,
    },
    newData: {
      subscription_tier: parsed.data.plan,
      subscription_plan: parsed.data.plan,
      reason: parsed.data.reason ?? null,
      target_email: oldTyped.email,
    },
  })

  revalidatePath(`/admin/uzytkownicy/${parsed.data.userId}`)
  revalidatePath('/admin/uzytkownicy')

  return { ok: true, message: `Plan zmieniony na "${parsed.data.plan}".` }
}

/**
 * Soft-delete użytkownika — ustawia `deleted_at = now()`.
 *
 * Nie kasuje fizycznie auth.users ani profiles (GDPR-safe — pełne
 * usunięcie idzie przez `/api/profile/delete` z confirm flow usera).
 *
 * Self-protection: admin nie może usunąć siebie.
 */
export async function adminSoftDeleteUserAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = softDeleteSchema.safeParse({
    userId: formData.get('userId'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Walidacja nieudana.',
    }
  }

  if (parsed.data.userId === user.userId) {
    return {
      ok: false,
      error: 'Nie możesz usunąć własnego konta z panelu admina.',
    }
  }

  const admin = createAdminClient()

  const { data: oldRow } = await admin
    .from('profiles')
    .select('id, email, deleted_at')
    .eq('id', parsed.data.userId)
    .maybeSingle()

  const oldTyped = oldRow as { id: string; email: string; deleted_at: string | null } | null
  if (!oldTyped) {
    return { ok: false, error: 'Użytkownik nie istnieje.' }
  }
  if (oldTyped.deleted_at) {
    return { ok: true, message: 'Konto już oznaczone jako usunięte.' }
  }

  const now = new Date().toISOString()
  const { error: updErr } = await admin
    .from('profiles')
    .update({ deleted_at: now, updated_at: now })
    .eq('id', parsed.data.userId)

  if (updErr) {
    return { ok: false, error: 'Nie udało się oznaczyć konta jako usuniętego.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'soft_delete_user',
    targetType: 'user',
    targetId: parsed.data.userId,
    oldData: { deleted_at: null },
    newData: {
      deleted_at: now,
      reason: parsed.data.reason,
      target_email: oldTyped.email,
    },
  })

  revalidatePath(`/admin/uzytkownicy/${parsed.data.userId}`)
  revalidatePath('/admin/uzytkownicy')

  return { ok: true, message: 'Konto oznaczone jako usunięte.' }
}

/**
 * Notatka admina do profilu użytkownika — wyłącznie w admin_logs.
 */
export async function adminAddUserNoteAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let user: AdminUser
  try {
    user = await requireAdmin()
  } catch (err) {
    return gateError(err)
  }

  const parsed = noteSchema.safeParse({
    userId: formData.get('userId'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Walidacja nieudana.',
    }
  }

  const admin = createAdminClient()

  const { data: profileRow } = await admin
    .from('profiles')
    .select('id, email')
    .eq('id', parsed.data.userId)
    .maybeSingle()

  if (!profileRow) {
    return { ok: false, error: 'Użytkownik nie istnieje.' }
  }

  await logAdminAction({
    adminId: user.userId,
    action: 'admin_note',
    targetType: 'user',
    targetId: parsed.data.userId,
    oldData: null,
    newData: {
      note: parsed.data.note,
      added_by_email: user.email,
      target_email: (profileRow as { email: string }).email,
    },
  })

  revalidatePath(`/admin/uzytkownicy/${parsed.data.userId}`)

  return { ok: true, message: 'Notatka zapisana w logach.' }
}
