'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { z } from 'zod'

import { getIp } from '@/lib/get-ip'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Actions dla auth (login / signup / reset password / logout).
 *
 * - Zod validation błędów wejścia
 * - Rate-limit `auth` (10 req/min/IP)
 * - Czytelne komunikaty PL
 * - Redirect z parametrem `next` (po loginie wraca tam gdzie chciał trafić)
 */

const emailSchema = z.string().trim().toLowerCase().email('Nieprawidłowy adres e-mail')
const passwordSchema = z.string().min(8, 'Hasło musi mieć minimum 8 znaków').max(128)

export interface AuthState {
  ok: boolean
  error?: string
  fields?: Record<string, string>
}

function ipFromHeaders(): string {
  const h = headers()
  const xff = h.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown'
  return h.get('x-real-ip') ?? 'unknown'
}

async function checkRateLimit(): Promise<AuthState | null> {
  const ip = ipFromHeaders()
  const r = await rateLimit(ip, 'auth')
  if (!r.ok) {
    return {
      ok: false,
      error: 'Za dużo prób. Spróbuj ponownie za chwilę.',
    }
  }
  return null
}

// -------------------------- LOGIN --------------------------

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Hasło jest wymagane'),
  next: z.string().optional(),
})

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await checkRateLimit()
  if (limited) return limited

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next'),
  })
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fields[issue.path[0] as string] = issue.message
    }
    return { ok: false, error: 'Sprawdź wprowadzone dane.', fields }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) {
    return {
      ok: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Nieprawidłowy e-mail lub hasło.'
          : 'Logowanie nieudane. Spróbuj ponownie.',
    }
  }

  const next = parsed.data.next && parsed.data.next.startsWith('/') ? parsed.data.next : '/panel'
  redirect(next)
}

// -------------------------- SIGNUP --------------------------

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal('on', { errorMap: () => ({ message: 'Musisz zaakceptować regulamin.' }) }),
  newsletter: z.string().optional(),
})

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await checkRateLimit()
  if (limited) return limited

  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    acceptTerms: formData.get('acceptTerms'),
    newsletter: formData.get('newsletter'),
  })
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fields[issue.path[0] as string] = issue.message
    }
    return { ok: false, error: 'Sprawdź wprowadzone dane.', fields }
  }

  const supabase = createClient()
  const headersList = headers()
  const origin = headersList.get('origin') ?? process.env['NEXT_PUBLIC_APP_URL'] ?? ''

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=/witaj`,
      data: {
        newsletter_opt_in: parsed.data.newsletter === 'on',
      },
    },
  })
  if (error) {
    return {
      ok: false,
      error: error.message.includes('already registered')
        ? 'Ten e-mail jest już zarejestrowany. Zaloguj się.'
        : 'Rejestracja nieudana. Spróbuj ponownie.',
    }
  }

  return {
    ok: true,
    error: undefined,
  }
}

// -------------------------- PASSWORD RESET --------------------------

const resetSchema = z.object({ email: emailSchema })

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limited = await checkRateLimit()
  if (limited) return limited

  const parsed = resetSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Nieprawidłowy adres e-mail.',
      fields: { email: parsed.error.issues[0]?.message ?? 'Nieprawidłowy e-mail' },
    }
  }

  const supabase = createClient()
  const headersList = headers()
  const origin = headersList.get('origin') ?? process.env['NEXT_PUBLIC_APP_URL'] ?? ''

  // Wynik zawsze 200 — nie ujawniamy czy email istnieje (enumeration prevention).
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-hasla/confirm`,
  })

  // Audit (best-effort, ignore failure) — nie czekamy
  void getIp

  return {
    ok: true,
  }
}

const confirmResetSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Hasła nie są identyczne.',
    path: ['passwordConfirm'],
  })

export async function confirmResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = confirmResetSchema.safeParse({
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  })
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fields[issue.path[0] as string] = issue.message
    }
    return { ok: false, error: 'Sprawdź wprowadzone dane.', fields }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { ok: false, error: 'Nie udało się zmienić hasła. Link mógł wygasnąć.' }
  }

  redirect('/panel')
}

// -------------------------- LOGOUT --------------------------

export async function logoutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
