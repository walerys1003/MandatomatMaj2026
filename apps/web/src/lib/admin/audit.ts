import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin audit log — uniform helper do wpisywania mutacji adminów do `admin_logs`.
 *
 * Schema (migracja 009):
 *   admin_logs(id, admin_id, action, target_type, target_id, old_data, new_data, created_at)
 *
 * Reguła: KAŻDA mutacja w panelu admina (UPDATE/DELETE/INSERT zasobu produktowego)
 * MUSI tworzyć wpis w admin_logs przed zwrotem z Server Action / endpointu.
 *
 * Helper:
 *   1. `requireAdmin()` — gating server-side (zwraca {userId} albo throw)
 *   2. `logAdminAction()` — wpis do admin_logs (best-effort: nie blokuje mutacji)
 *   3. `withAdminAudit()` — wrapper łączący weryfikację + zapis logu
 */

export interface AdminUser {
  userId: string
  email: string
}

export class AdminGateError extends Error {
  constructor(
    message: string,
    public readonly status: number = 403,
  ) {
    super(message)
    this.name = 'AdminGateError'
  }
}

/**
 * Sprawdza, czy aktualnie zalogowany user ma rolę 'admin'.
 * Throw AdminGateError jeśli nie.
 *
 * Uwaga: używa zwykłego klienta (RLS) — sprawdzenie przez `profiles.role`.
 * Layout `/admin` już to robi przy SSR, ale Server Actions / API muszą
 * powtórzyć weryfikację (defense in depth).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AdminGateError('Wymagane logowanie.', 401)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .maybeSingle()

  const row = profile as { role: string | null; email: string | null } | null
  if (!row || row.role !== 'admin') {
    throw new AdminGateError('Brak uprawnień administratora.', 403)
  }

  return {
    userId: user.id,
    email: row.email ?? user.email ?? '',
  }
}

/**
 * Logged target types — wąska enumeracja, żeby łatwo filtrować w UI logów.
 */
export type AuditTargetType =
  | 'case'
  | 'user'
  | 'prompt_template'
  | 'case_type_config'
  | 'payment'
  | 'document'
  | 'feedback'

export interface AuditEntry {
  adminId: string
  action: string
  targetType: AuditTargetType
  targetId: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
}

/**
 * Wpis do `admin_logs` — best-effort.
 * Nigdy nie throwuje (audit nie powinien blokować właściwej mutacji),
 * błąd loguje console.error.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('admin_logs').insert({
    admin_id: entry.adminId,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId,
    old_data: entry.oldData ?? null,
    new_data: entry.newData ?? null,
  })

  if (error) {
    console.error('[admin-audit] failed to log action:', entry.action, error)
  }
}

/**
 * Wrapper: weryfikuje admina + uruchamia callback + loguje rezultat.
 *
 * Throw AdminGateError → propagowany do callera (Server Action zwraca state.error).
 * Throw inne → propagowane (bez logu).
 */
export async function withAdminAudit<T>(
  meta: Omit<AuditEntry, 'adminId'>,
  action: (admin: AdminUser) => Promise<T>,
): Promise<T> {
  const adminUser = await requireAdmin()
  const result = await action(adminUser)
  await logAdminAction({ ...meta, adminId: adminUser.userId })
  return result
}
