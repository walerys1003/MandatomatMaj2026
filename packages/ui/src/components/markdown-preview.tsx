'use client'

import * as React from 'react'

import { cn } from '../lib/cn'

/**
 * <MarkdownPreview> — render pisma w typografii pisma urzędowego (chunk T13).
 *
 * Cechy:
 *  - Times serif (serif systemowy fallback) 12pt-equivalent
 *  - line-height 1.6
 *  - text-align: justify
 *  - akapity z text-indent 1.25cm (poza pierwszym)
 *  - h1 uppercase + letter-spacing
 *
 * Bez `marked` ani `DOMPurify` po stronie klienta — używamy lekkiego parsera
 * markdown w runtime żeby uniknąć bundla. Akceptujemy ograniczony subset:
 *   # ## ### nagłówki, akapity, listy -, listy 1., **bold**, *italic*, blockquote >.
 *
 * Bezpieczeństwo: NIE renderujemy raw HTML. Każdy znak < > & jest escapowany.
 */

interface MarkdownPreviewProps {
  content: string
  className?: string
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return c
    }
  })
}

function renderInline(s: string): string {
  let out = escapeHtml(s)
  // **bold**
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
  // *italic*
  out = out.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>')
  // [text](url) — tylko https/mailto, escape href
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, (_m, t, href) => {
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${t}</a>`
  })
  return out
}

function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    // pusty wiersz
    if (line.trim() === '') {
      i++
      continue
    }

    // headery
    const h = /^(#{1,6})\s+(.+)$/.exec(line)
    if (h) {
      const level = h[1]!.length
      blocks.push(`<h${level}>${renderInline(h[2]!)}</h${level}>`)
      i++
      continue
    }

    // blockquote
    if (line.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && lines[i]!.startsWith('> ')) {
        buf.push(lines[i]!.slice(2))
        i++
      }
      blocks.push(`<blockquote>${renderInline(buf.join(' '))}</blockquote>`)
      continue
    }

    // ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i]!)) {
        items.push(`<li>${renderInline(lines[i]!.replace(/^\d+\.\s/, ''))}</li>`)
        i++
      }
      blocks.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    // unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i]!)) {
        items.push(`<li>${renderInline(lines[i]!.replace(/^[-*]\s/, ''))}</li>`)
        i++
      }
      blocks.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    // paragraph — łączymy kolejne nie-puste linie
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !/^(#|>|-|\*|\d+\.)/.test(lines[i]!.trimStart())
    ) {
      buf.push(lines[i]!)
      i++
    }
    blocks.push(`<p>${renderInline(buf.join(' '))}</p>`)
  }

  return blocks.join('\n')
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const html = React.useMemo(() => renderMarkdown(content), [content])

  return (
    <article
      className={cn('mm-letter', className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
