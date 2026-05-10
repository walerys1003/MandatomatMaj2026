import { serverEnv } from '@/lib/env'

/**
 * Wrapper na Resend API.
 *
 * Edge-compatible (fetch zamiast SDK).
 * Cele:
 *  - jeden punkt wysyłki maili
 *  - typed templates (react-like, ale plain HTML strings — bez react-dom/server zależności w Edge)
 *  - retries + telemetry
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

const FROM_DEFAULT = 'Mandatomat <powiadomienia@mandatomat.pl>'
const REPLY_TO_DEFAULT = 'pomoc@mandatomat.pl'

export class EmailError extends Error {
  public readonly status?: number
  public override readonly cause?: unknown

  constructor(message: string, status?: number, cause?: unknown) {
    super(message)
    this.name = 'EmailError'
    if (status !== undefined) this.status = status
    if (cause !== undefined) this.cause = cause
  }
}

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  /** Dodatkowe tagi (Resend tagging API). */
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  id: string
  /** Czy wysłano (Resend zwraca id zaraz, delivery async). */
  ok: boolean
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = serverEnv.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback — log do konsoli zamiast crashu
    console.warn('[email] RESEND_API_KEY not set — email NOT sent (dev mode):', {
      to: input.to,
      subject: input.subject,
    })
    return { id: 'dev-skipped', ok: false }
  }

  const payload = {
    from: input.from ?? FROM_DEFAULT,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text ?? stripHtml(input.html),
    reply_to: input.replyTo ?? REPLY_TO_DEFAULT,
    tags: input.tags,
  }

  let res: Response
  try {
    res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new EmailError('Nie udało się połączyć z Resend.', undefined, err)
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new EmailError(`Resend HTTP ${res.status}: ${errBody.slice(0, 200)}`, res.status)
  }

  const data = (await res.json()) as { id: string }
  return { id: data.id, ok: true }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}
