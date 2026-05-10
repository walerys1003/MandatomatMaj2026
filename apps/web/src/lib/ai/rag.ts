/**
 * RAG hybrid search client (T7-AI-001..003).
 *
 * Wywołuje Postgres function `rag_search(query_text, query_embedding, ...)`
 * z migracji 024_rag_embeddings.sql. Zwraca top-K chunków posortowane
 * po combined_score (BM25*0.3 + cosine*0.7).
 *
 * Embeddings provider:
 *   - OpenAI `text-embedding-3-small` (1536 dim, $0.02/1M tokens)
 *   - Lub Voyage AI `voyage-3` (better PL quality, $0.06/1M)
 *
 * Tutaj domyślnie OpenAI — kompatybilne z `get_external_api_docs`.
 */

import { serverEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export interface RagChunk {
  id: string
  sourceType: 'knowledge' | 'blog' | 'category' | 'poradnik' | 'faq' | 'prompt'
  sourceId: string
  title: string | null
  content: string
  tags: string[]
  bm25Score: number
  vectorScore: number
  combinedScore: number
}

export interface RagSearchOptions {
  /** Maksymalna liczba zwracanych chunków. */
  limit?: number
  /** Tylko z określonych source types. */
  sourceTypes?: Array<'knowledge' | 'blog' | 'category' | 'poradnik' | 'faq' | 'prompt'>
  /** Tylko z tymi tagami (OR matching przez `&&`). */
  tags?: string[]
  /** Waga BM25 (0-1). Default 0.3. */
  bm25Weight?: number
  /** Waga vector cosine (0-1). Default 0.7. */
  vectorWeight?: number
}

/**
 * Generuje embedding przez OpenAI API.
 * Wymaga OPENAI_API_KEY w env.
 */
export async function embed(text: string): Promise<number[]> {
  const apiKey = serverEnv.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY required for RAG embeddings')
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // max ~8k tokens
      dimensions: 1536,
    }),
  })

  if (!res.ok) {
    throw new Error(`Embedding API failed: ${res.status}`)
  }

  const data = (await res.json()) as {
    data: Array<{ embedding: number[] }>
  }
  const first = data.data[0]
  if (!first) throw new Error('No embedding returned')
  return first.embedding
}

/**
 * Wykonaj hybrid search (BM25 + vector).
 */
export async function ragSearch(
  query: string,
  options: RagSearchOptions = {},
): Promise<RagChunk[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const embedding = await embed(trimmed)
  const supabase = createClient()

  const { data, error } = await supabase.rpc('rag_search', {
    query_text: trimmed,
    query_embedding: embedding,
    match_count: options.limit ?? 8,
    filter_tags: options.tags ?? null,
    filter_source_types: options.sourceTypes ?? null,
    bm25_weight: options.bm25Weight ?? 0.3,
    vector_weight: options.vectorWeight ?? 0.7,
  })

  if (error) {
    throw new Error(`rag_search RPC failed: ${error.message}`)
  }

  type Row = {
    id: string
    source_type: RagChunk['sourceType']
    source_id: string
    title: string | null
    content: string
    tags: string[]
    bm25_score: number
    vector_score: number
    combined_score: number
  }

  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    content: row.content,
    tags: row.tags,
    bm25Score: row.bm25_score,
    vectorScore: row.vector_score,
    combinedScore: row.combined_score,
  }))
}

/**
 * Build prompt fragment z najlepszych chunków.
 * Używane przed wywołaniem Claude — wstrzykuje context do system prompt.
 */
export function buildContextFragment(chunks: RagChunk[]): string {
  if (chunks.length === 0) return ''
  return chunks
    .map((c, i) => {
      const title = c.title ? `**${c.title}**` : `Źródło ${i + 1}`
      return `[${c.sourceType}:${c.sourceId}] ${title}\n${c.content}`
    })
    .join('\n\n---\n\n')
}
