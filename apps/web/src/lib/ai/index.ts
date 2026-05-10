/**
 * Public API biblioteki AI — używane przez Server Actions / API routes Tier 3.
 *
 * Wszystkie wywołania Claude'a przechodzą przez `callClaude()` —
 * tam pojawi się retry, telemetria, fallback, pomiar kosztów.
 */

export { callClaude, AnthropicError } from './anthropic'
export type { AnthropicMessage, AnthropicCallOptions, AnthropicResult } from './anthropic'

export {
  letterResponseSchema,
  podstawaPrawnaSchema,
  argumentSchema,
  scoringLabel,
} from './prompts/scoring'
export type { LetterResponse } from './prompts/scoring'

export { M1_SYSTEM_PROMPT, buildM1UserPrompt } from './prompts/m1-sprzeciw-predkosc'
export type { M1Input } from './prompts/m1-sprzeciw-predkosc'
