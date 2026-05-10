/**
 * Public API biblioteki AI — używane przez Server Actions / API routes Tier 3.
 *
 * Wszystkie wywołania Claude'a przechodzą przez `callClaude()` (anthropic.ts) —
 * tam pojawi się retry, telemetria, fallback, pomiar kosztów.
 */

// Niskopoziomowy wrapper
export { callClaude, AnthropicError } from './anthropic'
export type { AnthropicMessage, AnthropicCallOptions, AnthropicResult } from './anthropic'

// Wysokopoziomowy wrapper (PRICING + generateDocument + scoring + validation + OCR)
export {
  PRICING,
  calcCostUsd,
  extractJson,
  generateDocument,
  scoringAnalysis,
  validateDocument,
  parseOcrDocument,
} from './claude'
export type {
  ModelPricing,
  ClaudeCallResult,
  GenerateDocumentOptions,
  ScoringInput,
  ScoringResult,
  ValidationResult,
  ParseOcrInput,
  OcrParsedDocument,
  OcrDocumentType,
} from './claude'

// Schemy walidacji odpowiedzi (Zod)
export {
  letterResponseSchema,
  podstawaPrawnaSchema,
  argumentSchema,
  scoringLabel,
} from './prompts/scoring'
export type { LetterResponse } from './prompts/scoring'

// Prompt loader (M1, M4, P1, P3, W1)
export { loadPrompt, hasPrompt } from './prompts'
export type {
  PromptInput,
  LoadedPrompt,
  M1Input,
  M4Input,
  P1Input,
  P3Input,
  W1Input,
} from './prompts'
