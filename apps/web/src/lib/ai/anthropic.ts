import { serverEnv } from '@/lib/env'

/**
 * Wrapper na Anthropic Messages API (Claude).
 *
 * Cele:
 *  - jeden punkt wywołania → łatwo dodać retries, telemetrię, fallback
 *  - typed response (content blocks)
 *  - obsługa błędów z czytelnymi komunikatami PL
 *
 * Używamy fetch zamiast SDK żeby działało na Edge runtime (mniejszy bundle).
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export type AnthropicRole = 'user' | 'assistant'

/** Block content — text + image (vision). */
export type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | {
      type: 'image'
      source:
        | { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'; data: string }
        | { type: 'url'; url: string }
    }

export interface AnthropicMessage {
  role: AnthropicRole
  /** String dla zwykłych wiadomości; array dla vision (text + image blocks). */
  content: string | AnthropicContentBlock[]
}

export interface AnthropicCallOptions {
  system?: string
  messages: AnthropicMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface AnthropicResult {
  text: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
  stopReason: string | null
  raw: unknown
}

export class AnthropicError extends Error {
  public readonly status?: number
  public override readonly cause?: unknown

  constructor(message: string, status?: number, cause?: unknown) {
    super(message)
    this.name = 'AnthropicError'
    this.status = status
    this.cause = cause
  }
}

export async function callClaude(opts: AnthropicCallOptions): Promise<AnthropicResult> {
  const apiKey = serverEnv.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AnthropicError('Brak ANTHROPIC_API_KEY w środowisku.')
  }

  const body = {
    model: opts.model ?? 'claude-sonnet-4-5-20250929',
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.4,
    system: opts.system,
    messages: opts.messages,
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new AnthropicError(
      `Anthropic API error: ${res.status} ${res.statusText}`,
      res.status,
      detail,
    )
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>
    usage: { input_tokens: number; output_tokens: number }
    stop_reason: string | null
  }

  const text = data.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!)
    .join('\n')
    .trim()

  return {
    text,
    usage: data.usage,
    stopReason: data.stop_reason,
    raw: data,
  }
}
