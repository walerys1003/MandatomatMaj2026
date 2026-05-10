import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

import { parseMarkdown, type MdBlock, type MdInline } from './markdown'

/**
 * PDF generator — Markdown → PDF (A4, Times Roman 12pt).
 *
 * Wymagania (chunk T11):
 *  - A4 (595.28 × 841.89 pt)
 *  - Times Roman 12pt (StandardFonts.TimesRoman / TimesRomanBold / TimesRomanItalic)
 *  - marginesy 2.5/2/2/3 cm = 70/56/56/85 pt
 *  - header: dane nadawcy (right-aligned), miejscowość + data
 *  - footer: "Wygenerowano przez Mandatomat.pl — {data}"
 *  - watermark "PROJEKT — przed płatnością" jeśli !paid
 *
 * Edge-compatible: pdf-lib działa na Cloudflare Workers / Vercel Edge.
 */

// ============================================================
// Types
// ============================================================

export interface PdfHeader {
  /** Dane nadawcy — wieloliniowe (każda linia = osobny string). */
  senderLines: string[]
  /** Miejscowość, dnia D miesiąca YYYY r. */
  placeAndDate: string
}

export interface GeneratePdfInput {
  title?: string
  /** Markdown content z LetterResponse. */
  contentMarkdown: string
  header?: PdfHeader
  /** Czy dodać watermark "PROJEKT". */
  draft?: boolean
  /** Numer wersji w stopce. */
  version?: number
}

export interface GeneratePdfResult {
  /** Bytes PDF — można put() do Storage lub zwrócić jako Response. */
  bytes: Uint8Array
  /** Liczba stron. */
  pageCount: number
}

// ============================================================
// Layout constants
// ============================================================

const PAGE = { w: 595.28, h: 841.89 } // A4
const MARGIN = { top: 70, right: 56, bottom: 56, left: 85 } // 2.5/2/2/3 cm
const CONTENT = {
  x: MARGIN.left,
  y: PAGE.h - MARGIN.top,
  w: PAGE.w - MARGIN.left - MARGIN.right,
}

const FONT_SIZE = {
  body: 12,
  h1: 16,
  h2: 14,
  h3: 13,
  small: 9,
}
const LINE_HEIGHT = 1.45

// Polish character handling — pdf-lib StandardFonts (WinAnsi) BRAK polskich znaków
// (ą, ć, ę, ł, ń, ó, ś, ź, ż). Mapowanie ASCII fallback dla MVP.
// Production: trzeba załadować custom font (Times-roman ttf z fontkit + embedFont).
function transliteratePolish(s: string): string {
  return s
    .replace(/[ą]/g, 'a')
    .replace(/[Ą]/g, 'A')
    .replace(/[ć]/g, 'c')
    .replace(/[Ć]/g, 'C')
    .replace(/[ę]/g, 'e')
    .replace(/[Ę]/g, 'E')
    .replace(/[ł]/g, 'l')
    .replace(/[Ł]/g, 'L')
    .replace(/[ń]/g, 'n')
    .replace(/[Ń]/g, 'N')
    .replace(/[ó]/g, 'o')
    .replace(/[Ó]/g, 'O')
    .replace(/[ś]/g, 's')
    .replace(/[Ś]/g, 'S')
    .replace(/[ź]/g, 'z')
    .replace(/[Ź]/g, 'Z')
    .replace(/[ż]/g, 'z')
    .replace(/[Ż]/g, 'Z')
    // Strip other unsupported chars (keep ASCII printable + common punctuation)
    .replace(/[^\x20-\x7E\n]/g, '')
}

// ============================================================
// Word wrap (very simple, fits to width)
// ============================================================

function wrapLine(font: PDFFont, size: number, text: string, maxWidth: number): string[] {
  const safe = transliteratePolish(text)
  const words = safe.split(/\s+/).filter((w) => w !== '')
  if (words.length === 0) return ['']

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const w = font.widthOfTextAtSize(candidate, size)
    if (w <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      // Long word — force break
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let buf = ''
        for (const ch of word) {
          const c2 = buf + ch
          if (font.widthOfTextAtSize(c2, size) > maxWidth) {
            lines.push(buf)
            buf = ch
          } else {
            buf = c2
          }
        }
        current = buf
      } else {
        current = word
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

// ============================================================
// Render context — manages cursor + page breaks
// ============================================================

interface RenderCtx {
  doc: PDFDocument
  fontRegular: PDFFont
  fontBold: PDFFont
  fontItalic: PDFFont
  page: PDFPage
  cursorY: number
  pageNumber: number
  draft: boolean
  version: number
}

function newPage(ctx: RenderCtx): void {
  ctx.page = ctx.doc.addPage([PAGE.w, PAGE.h])
  ctx.pageNumber += 1
  ctx.cursorY = CONTENT.y
  drawFooter(ctx)
  if (ctx.draft) drawWatermark(ctx)
}

function ensureSpace(ctx: RenderCtx, needed: number): void {
  if (ctx.cursorY - needed < MARGIN.bottom + 30) {
    newPage(ctx)
  }
}

function drawFooter(ctx: RenderCtx): void {
  const dateStr = formatPolishDate(new Date())
  const text = transliteratePolish(`Wygenerowano przez Mandatomat.pl — ${dateStr} · v${ctx.version} · str. ${ctx.pageNumber}`)
  ctx.page.drawText(text, {
    x: MARGIN.left,
    y: 30,
    size: FONT_SIZE.small,
    font: ctx.fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  })
}

function drawWatermark(ctx: RenderCtx): void {
  // Diagonal text "PROJEKT — przed płatnością" w środku strony
  const text = transliteratePolish('PROJEKT — przed platnoscia')
  const size = 60
  const w = ctx.fontBold.widthOfTextAtSize(text, size)
  ctx.page.drawText(text, {
    x: PAGE.w / 2 - w / 2 + 80,
    y: PAGE.h / 2 - 30,
    size,
    font: ctx.fontBold,
    color: rgb(0.92, 0.92, 0.92),
    rotate: { type: 'degrees', angle: 45 } as { type: 'degrees'; angle: number },
  })
}

// ============================================================
// Block renderers
// ============================================================

function pickFont(ctx: RenderCtx, inline: MdInline): PDFFont {
  if (inline.bold) return ctx.fontBold
  if (inline.italic) return ctx.fontItalic
  return ctx.fontRegular
}

function drawInlines(
  ctx: RenderCtx,
  inlines: MdInline[],
  size: number,
  maxWidth: number,
  indent = 0,
): void {
  // Concat all inline text to one string for wrapping
  // (uproszczenie: bold/italic mieszanie pominięte — używamy dominującego stylu z pierwszego inline)
  const fullText = inlines.map((i) => i.text).join('')
  const dominantBold = inlines.some((i) => i.bold && i.text.length > fullText.length / 2)
  const font = dominantBold ? ctx.fontBold : ctx.fontRegular

  const lines = wrapLine(font, size, fullText, maxWidth - indent)
  const lineHeight = size * LINE_HEIGHT

  for (const line of lines) {
    ensureSpace(ctx, lineHeight)
    ctx.page.drawText(line, {
      x: CONTENT.x + indent,
      y: ctx.cursorY - size,
      size,
      font,
      color: rgb(0.05, 0.05, 0.05),
    })
    ctx.cursorY -= lineHeight
  }
}

function drawBlock(ctx: RenderCtx, block: MdBlock): void {
  switch (block.type) {
    case 'h1': {
      ensureSpace(ctx, FONT_SIZE.h1 * 2)
      ctx.cursorY -= 8 // top spacing
      const text = transliteratePolish(block.inlines.map((i) => i.text).join(''))
      const lines = wrapLine(ctx.fontBold, FONT_SIZE.h1, text, CONTENT.w)
      for (const line of lines) {
        ensureSpace(ctx, FONT_SIZE.h1 * LINE_HEIGHT)
        ctx.page.drawText(line, {
          x: CONTENT.x,
          y: ctx.cursorY - FONT_SIZE.h1,
          size: FONT_SIZE.h1,
          font: ctx.fontBold,
        })
        ctx.cursorY -= FONT_SIZE.h1 * LINE_HEIGHT
      }
      ctx.cursorY -= 6
      break
    }
    case 'h2': {
      ensureSpace(ctx, FONT_SIZE.h2 * 2)
      ctx.cursorY -= 6
      const text = transliteratePolish(block.inlines.map((i) => i.text).join(''))
      const lines = wrapLine(ctx.fontBold, FONT_SIZE.h2, text, CONTENT.w)
      for (const line of lines) {
        ensureSpace(ctx, FONT_SIZE.h2 * LINE_HEIGHT)
        ctx.page.drawText(line, {
          x: CONTENT.x,
          y: ctx.cursorY - FONT_SIZE.h2,
          size: FONT_SIZE.h2,
          font: ctx.fontBold,
        })
        ctx.cursorY -= FONT_SIZE.h2 * LINE_HEIGHT
      }
      ctx.cursorY -= 4
      break
    }
    case 'h3': {
      ensureSpace(ctx, FONT_SIZE.h3 * 2)
      ctx.cursorY -= 4
      const text = transliteratePolish(block.inlines.map((i) => i.text).join(''))
      const lines = wrapLine(ctx.fontBold, FONT_SIZE.h3, text, CONTENT.w)
      for (const line of lines) {
        ensureSpace(ctx, FONT_SIZE.h3 * LINE_HEIGHT)
        ctx.page.drawText(line, {
          x: CONTENT.x,
          y: ctx.cursorY - FONT_SIZE.h3,
          size: FONT_SIZE.h3,
          font: ctx.fontBold,
        })
        ctx.cursorY -= FONT_SIZE.h3 * LINE_HEIGHT
      }
      ctx.cursorY -= 3
      break
    }
    case 'p': {
      drawInlines(ctx, block.inlines, FONT_SIZE.body, CONTENT.w)
      ctx.cursorY -= 4
      break
    }
    case 'ul': {
      for (const item of block.items) {
        ensureSpace(ctx, FONT_SIZE.body * LINE_HEIGHT)
        ctx.page.drawText('•', {
          x: CONTENT.x,
          y: ctx.cursorY - FONT_SIZE.body,
          size: FONT_SIZE.body,
          font: ctx.fontRegular,
        })
        drawInlines(ctx, item, FONT_SIZE.body, CONTENT.w - 16, 16)
        ctx.cursorY -= 2
      }
      ctx.cursorY -= 4
      break
    }
    case 'ol': {
      block.items.forEach((item, idx) => {
        ensureSpace(ctx, FONT_SIZE.body * LINE_HEIGHT)
        const numStr = `${idx + 1}.`
        ctx.page.drawText(numStr, {
          x: CONTENT.x,
          y: ctx.cursorY - FONT_SIZE.body,
          size: FONT_SIZE.body,
          font: ctx.fontRegular,
        })
        drawInlines(ctx, item, FONT_SIZE.body, CONTENT.w - 22, 22)
        ctx.cursorY -= 2
      })
      ctx.cursorY -= 4
      break
    }
    case 'quote': {
      // Indent + italic
      const text = transliteratePolish(block.inlines.map((i) => i.text).join(''))
      const lines = wrapLine(ctx.fontItalic, FONT_SIZE.body, text, CONTENT.w - 24)
      for (const line of lines) {
        ensureSpace(ctx, FONT_SIZE.body * LINE_HEIGHT)
        ctx.page.drawText(line, {
          x: CONTENT.x + 24,
          y: ctx.cursorY - FONT_SIZE.body,
          size: FONT_SIZE.body,
          font: ctx.fontItalic,
          color: rgb(0.3, 0.3, 0.3),
        })
        ctx.cursorY -= FONT_SIZE.body * LINE_HEIGHT
      }
      ctx.cursorY -= 4
      break
    }
    case 'hr': {
      ensureSpace(ctx, 12)
      ctx.cursorY -= 6
      ctx.page.drawLine({
        start: { x: CONTENT.x, y: ctx.cursorY },
        end: { x: CONTENT.x + CONTENT.w, y: ctx.cursorY },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      })
      ctx.cursorY -= 8
      break
    }
    case 'spacer': {
      ctx.cursorY -= 12
      break
    }
  }
}

// ============================================================
// Header (dane nadawcy + miejscowość/data) — top of first page
// ============================================================

function drawHeader(ctx: RenderCtx, header: PdfHeader): void {
  // Sender block — right-aligned
  let y = ctx.cursorY
  for (const rawLine of header.senderLines) {
    const line = transliteratePolish(rawLine)
    const w = ctx.fontRegular.widthOfTextAtSize(line, FONT_SIZE.body)
    ctx.page.drawText(line, {
      x: CONTENT.x + CONTENT.w - w,
      y: y - FONT_SIZE.body,
      size: FONT_SIZE.body,
      font: ctx.fontRegular,
    })
    y -= FONT_SIZE.body * LINE_HEIGHT
  }

  // Place + date — right-aligned, below sender
  y -= 6
  const dateLine = transliteratePolish(header.placeAndDate)
  const dw = ctx.fontRegular.widthOfTextAtSize(dateLine, FONT_SIZE.body)
  ctx.page.drawText(dateLine, {
    x: CONTENT.x + CONTENT.w - dw,
    y: y - FONT_SIZE.body,
    size: FONT_SIZE.body,
    font: ctx.fontRegular,
  })
  y -= FONT_SIZE.body * LINE_HEIGHT

  ctx.cursorY = y - 14
}

// ============================================================
// Polish date format
// ============================================================

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
]

export function formatPolishDate(d: Date): string {
  const day = d.getDate()
  const month = POLISH_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year} r.`
}

// ============================================================
// Main entry
// ============================================================

export async function generatePdf(input: GeneratePdfInput): Promise<GeneratePdfResult> {
  const doc = await PDFDocument.create()
  doc.setTitle(input.title ?? 'Pismo')
  doc.setAuthor('Mandatomat.pl')
  doc.setProducer('Mandatomat.pl')
  doc.setCreator('Mandatomat.pl')

  const fontRegular = await doc.embedFont(StandardFonts.TimesRoman)
  const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)

  const ctx: RenderCtx = {
    doc,
    fontRegular,
    fontBold,
    fontItalic,
    page: doc.addPage([PAGE.w, PAGE.h]),
    cursorY: CONTENT.y,
    pageNumber: 1,
    draft: input.draft ?? false,
    version: input.version ?? 1,
  }

  drawFooter(ctx)
  if (ctx.draft) drawWatermark(ctx)

  if (input.header) {
    drawHeader(ctx, input.header)
  }

  const blocks = parseMarkdown(input.contentMarkdown)
  for (const block of blocks) {
    drawBlock(ctx, block)
  }

  const bytes = await doc.save()
  return {
    bytes,
    pageCount: ctx.pageNumber,
  }
}
