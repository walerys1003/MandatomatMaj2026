/**
 * Prompt caching (Anthropic ephemeral cache) — T7-AI-008.
 *
 * Anthropic API ma `cache_control: { type: 'ephemeral' }` na content blokach.
 * Pierwszy hit zapisuje cache (cost: 25% extra), kolejne w oknie 5 min czytają (cost: 10%).
 * Net: jeśli system prompt > 1024 tokenów i jest reusable → -50% kosztu przy reuse.
 *
 * Reguły UŻYCIA:
 *  - System prompt > 1024 tokenów (Anthropic minimum dla cache)
 *  - Reused często (np. VALIDATION_SYSTEM_PROMPT używany dla każdej walidacji)
 *  - NIE używać dla unique user inputs (form_data) — to się NIE cache'uje
 *
 * Tutaj definiujemy:
 *  1. Listę cachable prompts + token estimates
 *  2. Helper budujący content block z `cache_control`
 *  3. Stats counter dla telemetry (cache_hit_rate)
 */

export interface CacheableSystemBlock {
  type: 'text'
  text: string
  cache_control: { type: 'ephemeral' }
}

/**
 * Builduj content block z ephemeral cache.
 * @param text - prompt text (musi być > 1024 tokenów ~= 4096 znaków by mieć sens)
 */
export function buildCachedSystemBlock(text: string): CacheableSystemBlock {
  return {
    type: 'text',
    text,
    cache_control: { type: 'ephemeral' },
  }
}

/**
 * Estymacja czy prompt jest worth cache'owania.
 * Threshold: ~4000 znaków (~1024 tokenów dla PL).
 */
export function isWorthCaching(text: string): boolean {
  return text.length >= 4000
}

/**
 * In-memory cache stats — agregowane per process lifetime.
 * W produkcji wysyłane do Sentry metrics co 5 min.
 */
class CacheStats {
  private hits = 0
  private misses = 0
  private writes = 0

  recordHit(): void {
    this.hits += 1
  }
  recordMiss(): void {
    this.misses += 1
  }
  recordWrite(): void {
    this.writes += 1
  }

  /** Cache hit rate 0-1. */
  hitRate(): number {
    const total = this.hits + this.misses
    return total === 0 ? 0 : this.hits / total
  }

  snapshot(): { hits: number; misses: number; writes: number; hitRate: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      writes: this.writes,
      hitRate: this.hitRate(),
    }
  }

  reset(): void {
    this.hits = 0
    this.misses = 0
    this.writes = 0
  }
}

export const cacheStats = new CacheStats()

/**
 * Parsuj Anthropic response usage → record cache hit/miss.
 * Anthropic zwraca w `usage`:
 *  - `cache_creation_input_tokens` — nowe wpisy do cache (write)
 *  - `cache_read_input_tokens` — cache hits
 */
export function recordCacheUsage(usage: {
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}): void {
  if ((usage.cache_creation_input_tokens ?? 0) > 0) {
    cacheStats.recordWrite()
  }
  if ((usage.cache_read_input_tokens ?? 0) > 0) {
    cacheStats.recordHit()
  } else if ((usage.cache_creation_input_tokens ?? 0) === 0) {
    // Ani read, ani write — to znaczy że nie używaliśmy cache w ogóle
    // (np. prompt poniżej minimum). Liczymy jako miss tylko gdy próbowaliśmy cache'ować.
    // Dla prostoty: pomijamy.
  }
}
