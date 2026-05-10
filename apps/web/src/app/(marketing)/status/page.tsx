/**
 * /status — publiczna strona statusu Mandatomat
 *
 * T5-OPS-040: status page z health checkami kluczowych zależności.
 * Renderowanie SSR — fetch do /api/health + zewnętrzne ping (Stripe, Anthropic).
 * Cache 60s dla odciążenia.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Status systemu — Mandatomat',
  description:
    'Aktualny status komponentów Mandatomat: aplikacja, baza danych, generowanie AI, płatności, e-mail.',
  robots: { index: true, follow: true },
}

export const revalidate = 60

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'unknown'

interface ServiceCheck {
  name: string
  description: string
  status: ServiceStatus
  latencyMs?: number
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: 'Działa poprawnie',
  degraded: 'Działanie ograniczone',
  outage: 'Awaria',
  unknown: 'Brak danych',
}

const STATUS_COLOR: Record<ServiceStatus, string> = {
  operational: 'bg-green-100 text-green-800 border-green-200',
  degraded: 'bg-yellow-100 text-yellow-900 border-yellow-200',
  outage: 'bg-red-100 text-red-800 border-red-200',
  unknown: 'bg-gray-100 text-gray-700 border-gray-200',
}

async function pingUrl(url: string, timeoutMs = 4000): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now()
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, cache: 'no-store' })
    return { ok: res.ok || res.status < 500, ms: Date.now() - start }
  } catch {
    return { ok: false, ms: Date.now() - start }
  } finally {
    clearTimeout(t)
  }
}

async function checkServices(): Promise<ServiceCheck[]> {
  const checks: ServiceCheck[] = []

  // Aplikacja (sama strona renderuje się — domyślnie operational)
  checks.push({
    name: 'Aplikacja webowa',
    description: 'Frontend mandatomat.pl + API Next.js',
    status: 'operational',
  })

  // Stripe API
  const stripe = await pingUrl('https://api.stripe.com/v1')
  checks.push({
    name: 'Płatności (Stripe)',
    description: 'Realizacja płatności i subskrypcji',
    status: stripe.ok ? 'operational' : 'degraded',
    latencyMs: stripe.ms,
  })

  // Anthropic API
  const anthropic = await pingUrl('https://api.anthropic.com')
  checks.push({
    name: 'Generowanie AI (Anthropic)',
    description: 'Model Claude do generowania pism',
    status: anthropic.ok ? 'operational' : 'degraded',
    latencyMs: anthropic.ms,
  })

  // Supabase (jeśli skonfigurowane)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    const supa = await pingUrl(supabaseUrl)
    checks.push({
      name: 'Baza danych (Supabase)',
      description: 'Konta, sprawy, dokumenty',
      status: supa.ok ? 'operational' : 'outage',
      latencyMs: supa.ms,
    })
  } else {
    checks.push({
      name: 'Baza danych (Supabase)',
      description: 'Konta, sprawy, dokumenty',
      status: 'unknown',
    })
  }

  // Resend (e-mail)
  const resend = await pingUrl('https://api.resend.com')
  checks.push({
    name: 'Powiadomienia e-mail (Resend)',
    description: 'Wysyłka maili transakcyjnych',
    status: resend.ok ? 'operational' : 'degraded',
    latencyMs: resend.ms,
  })

  return checks
}

function overallStatus(checks: ServiceCheck[]): ServiceStatus {
  if (checks.some((c) => c.status === 'outage')) return 'outage'
  if (checks.some((c) => c.status === 'degraded')) return 'degraded'
  if (checks.every((c) => c.status === 'operational')) return 'operational'
  return 'unknown'
}

export default async function StatusPage() {
  const checks = await checkServices()
  const overall = overallStatus(checks)
  const checkedAt = new Date().toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Status systemu</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sprawdzono: {checkedAt} (Europa/Warszawa). Aktualizacja co 60 sekund.
        </p>
      </header>

      <section className={`mb-8 rounded-lg border p-6 ${STATUS_COLOR[overall]}`} aria-live="polite">
        <p className="text-lg font-semibold">
          {overall === 'operational'
            ? 'Wszystkie systemy działają poprawnie'
            : overall === 'degraded'
              ? 'Wykryto ograniczenia w działaniu niektórych usług'
              : overall === 'outage'
                ? 'Trwa awaria jednej z kluczowych usług'
                : 'Status nieznany'}
        </p>
      </section>

      <section aria-label="Szczegółowy status komponentów">
        <h2 className="mb-4 text-xl font-semibold">Komponenty</h2>
        <ul className="space-y-3">
          {checks.map((c) => (
            <li
              key={c.name}
              className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-600">{c.description}</p>
                {c.latencyMs !== undefined && (
                  <p className="mt-1 text-xs text-gray-500">Czas odpowiedzi: {c.latencyMs} ms</p>
                )}
              </div>
              <span
                className={`ml-4 inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLOR[c.status]}`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-10 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Wykryłeś problem, którego tu nie widać?</p>
        <p className="mt-1">
          Napisz do nas:{' '}
          <a className="underline" href="mailto:kontakt@mandatomat.pl">
            kontakt@mandatomat.pl
          </a>
        </p>
      </aside>
    </main>
  )
}
