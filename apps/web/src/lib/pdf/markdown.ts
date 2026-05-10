/**
 * Mini Markdown parser dla PDF rendererów.
 *
 * Obsługuje:
 *  - # h1, ## h2, ### h3
 *  - **bold**, *italic*
 *  - listy: - item, 1. item
 *  - akapity (puste linie = separator)
 *  - cytaty: > text (renderowane jako akapit z indent)
 *
 * Output: tablica nodes — łatwe do zmapowania na pdf-lib draw* calls.
 */

export type MdInline =
  | { kind: 'text'; text: string; bold?: boolean; italic?: boolean }

export type MdBlock =
  | { type: 'h1'; inlines: MdInline[] }
  | { type: 'h2'; inlines: MdInline[] }
  | { type: 'h3'; inlines: MdInline[] }
  | { type: 'p'; inlines: MdInline[] }
  | { type: 'ul'; items: MdInline[][] }
  | { type: 'ol'; items: MdInline[][] }
  | { type: 'quote'; inlines: MdInline[] }
  | { type: 'hr' }
  | { type: 'spacer' }

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g

function parseInlines(text: string): MdInline[] {
  if (!text) return []
  const parts = text.split(INLINE_RE).filter((p) => p !== '')
  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return { kind: 'text', text: part.slice(2, -2), bold: true }
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return { kind: 'text', text: part.slice(1, -1), italic: true }
    }
    return { kind: 'text', text: part }
  })
}

export function parseMarkdown(md: string): MdBlock[] {
  const blocks: MdBlock[] = []
  const lines = md.replace(/\r\n/g, '\n').split('\n')

  let i = 0
  let paraBuf: string[] = []
  let listBuf: { kind: 'ul' | 'ol'; items: string[] } | null = null

  function flushPara() {
    if (paraBuf.length === 0) return
    const text = paraBuf.join(' ').trim()
    if (text) blocks.push({ type: 'p', inlines: parseInlines(text) })
    paraBuf = []
  }

  function flushList() {
    if (!listBuf) return
    blocks.push({
      type: listBuf.kind,
      items: listBuf.items.map((t) => parseInlines(t)),
    })
    listBuf = null
  }

  while (i < lines.length) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Empty line — flush
    if (trimmed === '') {
      flushPara()
      flushList()
      i++
      continue
    }

    // Headings
    const h1 = trimmed.match(/^# (.+)$/)
    if (h1) {
      flushPara()
      flushList()
      blocks.push({ type: 'h1', inlines: parseInlines(h1[1]!) })
      i++
      continue
    }
    const h2 = trimmed.match(/^## (.+)$/)
    if (h2) {
      flushPara()
      flushList()
      blocks.push({ type: 'h2', inlines: parseInlines(h2[1]!) })
      i++
      continue
    }
    const h3 = trimmed.match(/^### (.+)$/)
    if (h3) {
      flushPara()
      flushList()
      blocks.push({ type: 'h3', inlines: parseInlines(h3[1]!) })
      i++
      continue
    }

    // HR
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushPara()
      flushList()
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Quote
    const q = trimmed.match(/^> (.+)$/)
    if (q) {
      flushPara()
      flushList()
      blocks.push({ type: 'quote', inlines: parseInlines(q[1]!) })
      i++
      continue
    }

    // Unordered list
    const ul = trimmed.match(/^[-*] (.+)$/)
    if (ul) {
      flushPara()
      if (!listBuf || listBuf.kind !== 'ul') {
        flushList()
        listBuf = { kind: 'ul', items: [] }
      }
      listBuf.items.push(ul[1]!)
      i++
      continue
    }

    // Ordered list
    const ol = trimmed.match(/^\d+\. (.+)$/)
    if (ol) {
      flushPara()
      if (!listBuf || listBuf.kind !== 'ol') {
        flushList()
        listBuf = { kind: 'ol', items: [] }
      }
      listBuf.items.push(ol[1]!)
      i++
      continue
    }

    // Paragraph
    flushList()
    paraBuf.push(trimmed)
    i++
  }

  flushPara()
  flushList()
  return blocks
}

/** Plain text (bez markdown) — np. dla pdf header. */
export function inlinesToPlain(inlines: MdInline[]): string {
  return inlines.map((i) => i.text).join('')
}
