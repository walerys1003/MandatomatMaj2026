/**
 * Server-Sent Events (SSE) streaming dla Claude (T7-AI-006).
 *
 * Strategia:
 *  - Anthropic API ma `stream: true` → zwraca event-stream
 *  - My re-emitujemy do klienta jako SSE z naszym kontraktem:
 *      event: "delta"  data: { text: string }
 *      event: "done"   data: { usage: {...}, costUsd: number }
 *      event: "error"  data: { message: string }
 *
 * Frontend używa `EventSource` lub `fetch` + ReadableStream reader.
 *
 * Edge-compatible: nie używamy SDK Anthropic, własny `fetch`.
 */

import { serverEnv } from '@/lib/env'
import { calcCostUsd } from './claude'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export interface StreamRequestOptions {
  model: string
  system: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  maxTokens?: number
  temperature?: number
}

interface AnthropicStreamEvent {
  type: string
  delta?: {
    type?: string
    text?: string
  }
  message?: {
    usage?: { input_tokens?: number; output_tokens?: number }
  }
  usage?: { input_tokens?: number; output_tokens?: number }
}

/**
 * Wywołaj Claude w trybie stream, zwraca ReadableStream z SSE eventami
 * gotowymi do oddania jako Response body.
 */
export async function streamClaude(opts: StreamRequestOptions): Promise<Response> {
  const apiKey = serverEnv.ANTHROPIC_API_KEY
  if (!apiKey) {
    return sseErrorResponse('ANTHROPIC_API_KEY brak konfiguracji')
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      system: opts.system,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.4,
      stream: true,
    }),
  })

  if (!upstream.ok || !upstream.body) {
    return sseErrorResponse(`Anthropic API error: ${upstream.status}`)
  }

  // Re-emit jako nasz SSE
  const stream = transformAnthropicStream(upstream.body, opts.model)

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}

function transformAnthropicStream(
  upstream: ReadableStream<Uint8Array>,
  model: string,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  let inputTokens = 0
  let outputTokens = 0

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // Split on double newlines (SSE event delimiter)
          let idx: number
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            const dataMatch = rawEvent.match(/^data: (.+)$/m)
            if (!dataMatch || !dataMatch[1]) continue

            let parsed: AnthropicStreamEvent | null = null
            try {
              parsed = JSON.parse(dataMatch[1]) as AnthropicStreamEvent
            } catch {
              continue
            }
            if (!parsed) continue

            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              controller.enqueue(
                encoder.encode(
                  `event: delta\ndata: ${JSON.stringify({ text: parsed.delta.text })}\n\n`,
                ),
              )
            } else if (parsed.type === 'message_start' && parsed.message?.usage) {
              inputTokens = parsed.message.usage.input_tokens ?? 0
            } else if (parsed.type === 'message_delta' && parsed.usage) {
              outputTokens = parsed.usage.output_tokens ?? outputTokens
            } else if (parsed.type === 'message_stop') {
              const costUsd = calcCostUsd(model, {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
              })
              controller.enqueue(
                encoder.encode(
                  `event: done\ndata: ${JSON.stringify({
                    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
                    costUsd,
                  })}\n\n`,
                ),
              )
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              message: err instanceof Error ? err.message : 'Stream error',
            })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })
}

function sseErrorResponse(message: string): Response {
  const body = `event: error\ndata: ${JSON.stringify({ message })}\n\n`
  return new Response(body, {
    status: 200, // SSE wymaga 200 nawet dla error eventów
    headers: { 'content-type': 'text/event-stream' },
  })
}
