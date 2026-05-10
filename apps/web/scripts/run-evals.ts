#!/usr/bin/env -S node --loader tsx
/**
 * T5-AI-027: Eval runner CLI.
 *
 * Wywołuje LLM dla każdego golden evalu (apps/web/src/lib/ai/evals),
 * parsuje JSON, waliduje przez validateEvalOutput() i raportuje wyniki.
 *
 * Użycie:
 *   pnpm -F @mandatomat/web evals                # wszystkie evals
 *   pnpm -F @mandatomat/web evals -- --filter M1  # tylko evals zaczynające się na M1
 *   pnpm -F @mandatomat/web evals -- --max 5     # max 5 evals (smoke test)
 *   pnpm -F @mandatomat/web evals -- --dry       # walidacja struktury, bez LLM
 *
 * Env:
 *   ANTHROPIC_API_KEY  — wymagany (chyba że --dry)
 *   EVAL_MODEL         — domyślnie 'claude-sonnet-4-5-20250929'
 *
 * Exit code: 0 gdy ≥70% evals przeszło, 1 w pozostałych przypadkach.
 */

/* eslint-disable no-console */

import {
  ALL_EVALS,
  validateEvalOutput,
  type EvalOutput,
  type GoldenEval,
} from '../src/lib/ai/evals'
import { VALIDATION_SYSTEM_PROMPT } from '../src/lib/ai/prompts/validation-system'

const PASS_THRESHOLD = 0.7
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

interface CliArgs {
  filter?: string
  max?: number
  dry: boolean
  model: string
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dry: false,
    model: process.env.EVAL_MODEL ?? 'claude-sonnet-4-5-20250929',
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--filter' && argv[i + 1]) {
      args.filter = argv[++i]
    } else if (a === '--max' && argv[i + 1]) {
      args.max = Number(argv[++i])
    } else if (a === '--dry') {
      args.dry = true
    } else if (a === '--model' && argv[i + 1]) {
      args.model = argv[++i]
    } else if (a === '-h' || a === '--help') {
      console.log('Usage: run-evals.ts [--filter <prefix>] [--max <N>] [--dry] [--model <id>]')
      process.exit(0)
    }
  }
  return args
}

async function callClaude(opts: {
  apiKey: string
  model: string
  system: string
  user: string
}): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4000,
      temperature: 0.3,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`)
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>
  }
  return data.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!)
    .join('\n')
    .trim()
}

function parseJsonStrict(raw: string): EvalOutput | { error: string } {
  // Próba: wyciągnij JSON z odpowiedzi (model czasem dodaje fencing)
  let text = raw.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
  }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1)
  }
  try {
    const parsed = JSON.parse(text) as EvalOutput
    return parsed
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

function buildUserPrompt(eval_: GoldenEval): string {
  return `Wygeneruj pismo dla następującego scenariusza:

CASE_TYPE: ${eval_.input.case_type ?? '(nieznany)'}
DANE WEJŚCIOWE (JSON):
${JSON.stringify(eval_.input, null, 2)}

Zwróć wyłącznie obiekt JSON zgodny ze schematem opisanym w system prompcie.`
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  let evals = ALL_EVALS
  if (args.filter) {
    const f = args.filter.toUpperCase()
    evals = evals.filter((e) => e.id.toUpperCase().startsWith(f))
  }
  if (args.max) {
    evals = evals.slice(0, args.max)
  }

  console.log(`\n=== Mandatomat eval runner ===`)
  console.log(`Evals do wykonania: ${evals.length} (z łącznie ${ALL_EVALS.length})`)
  console.log(`Model: ${args.model}`)
  console.log(`Tryb: ${args.dry ? 'DRY (bez LLM)' : 'LIVE (LLM call)'}`)
  console.log('')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!args.dry && !apiKey) {
    console.error('✗ Brak ANTHROPIC_API_KEY w env. Użyj --dry lub ustaw klucz.')
    process.exit(1)
  }

  let passed = 0
  let failed = 0
  let errored = 0
  const failureDetails: Array<{ id: string; reasons: string[] }> = []

  for (let i = 0; i < evals.length; i++) {
    const e = evals[i]
    const prefix = `[${i + 1}/${evals.length}] ${e.id.padEnd(8)}`
    const start = Date.now()

    if (args.dry) {
      // Tylko walidacja struktury — generujemy mock output zgodny ze schematem
      const mock: EvalOutput = {
        tytul: 'MOCK ' + (e.input.case_type ?? 'pismo'),
        do_organu: 'MOCK organ',
        podstawy_prawne: e.mustContainPodstawy.length > 0 ? e.mustContainPodstawy : ['art. 1 KW'],
        argumentacja: e.mustContainArgumenty.length > 0 ? e.mustContainArgumenty : ['mock arg'],
        wnioski: ['Wnoszę o uchylenie'],
        scoring_szans: (e.expectedScoring.min + e.expectedScoring.max) / 2,
        ostrzezenia: [],
      }
      const r = validateEvalOutput(e, mock)
      if (r.passed) {
        passed++
        console.log(`${prefix} ✓ (dry, ${fmtMs(Date.now() - start)})`)
      } else {
        failed++
        failureDetails.push({ id: e.id, reasons: r.failures })
        console.log(`${prefix} ✗ ${r.failures[0]}`)
      }
      continue
    }

    try {
      const raw = await callClaude({
        apiKey: apiKey!,
        model: args.model,
        system: VALIDATION_SYSTEM_PROMPT,
        user: buildUserPrompt(e),
      })
      const parsed = parseJsonStrict(raw)
      if ('error' in parsed) {
        errored++
        failureDetails.push({ id: e.id, reasons: ['JSON parse: ' + parsed.error] })
        console.log(`${prefix} ⚠ JSON parse failed (${fmtMs(Date.now() - start)})`)
        continue
      }
      const r = validateEvalOutput(e, parsed)
      if (r.passed) {
        passed++
        console.log(`${prefix} ✓ ${fmtMs(Date.now() - start)}`)
      } else {
        failed++
        failureDetails.push({ id: e.id, reasons: r.failures })
        console.log(`${prefix} ✗ ${r.failures.length} naruszen (${fmtMs(Date.now() - start)})`)
        for (const f of r.failures.slice(0, 3)) console.log(`         - ${f}`)
        if (r.failures.length > 3) console.log(`         (+${r.failures.length - 3} wiecej)`)
      }
    } catch (err) {
      errored++
      const msg = err instanceof Error ? err.message : String(err)
      failureDetails.push({ id: e.id, reasons: ['LLM call: ' + msg] })
      console.log(`${prefix} ⚠ ${msg.slice(0, 80)} (${fmtMs(Date.now() - start)})`)
    }
  }

  const total = evals.length
  const passRate = total > 0 ? passed / total : 0
  console.log('')
  console.log('=== Podsumowanie ===')
  console.log(`Total:   ${total}`)
  console.log(`Passed:  ${passed} (${(passRate * 100).toFixed(1)}%)`)
  console.log(`Failed:  ${failed}`)
  console.log(`Errored: ${errored}`)
  console.log(
    `Próg:    ${(PASS_THRESHOLD * 100).toFixed(0)}% — ${passRate >= PASS_THRESHOLD ? 'OSIĄGNIĘTY ✓' : 'NIE OSIĄGNIĘTY ✗'}`,
  )

  if (failureDetails.length > 0) {
    console.log('')
    console.log('=== Detale niepowodzeń (top 10) ===')
    for (const f of failureDetails.slice(0, 10)) {
      console.log(`  ${f.id}: ${f.reasons.slice(0, 2).join(' | ')}`)
    }
  }

  process.exit(passRate >= PASS_THRESHOLD ? 0 : 1)
}

main().catch((err) => {
  console.error('Eval runner crashed:', err)
  process.exit(2)
})
