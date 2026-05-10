import type { LetterResponse } from './prompts/scoring'

/**
 * Renderuje JSON-strukturalną odpowiedź Claude'a do Markdown-pisma.
 *
 * Markdown jest źródłem prawdy — z niego generujemy PDF (Tier 4) oraz
 * pokazujemy w `<MarkdownPreview>` na `/sprawy/[caseId]/podglad`.
 *
 * Format inspirowany realnymi pismami sądowymi/administracyjnymi:
 *  - nagłówek z miejscem na datę i miejscowość
 *  - dane wnoszącego
 *  - dane adresata
 *  - tytuł pisma (h1)
 *  - podstawy prawne (lista punktowana)
 *  - argumentacja (h2 + treść per punkt)
 *  - wnioski (lista numerowana)
 *  - podpis (placeholder)
 */

export interface LetterRenderContext {
  /** Imię i nazwisko wnoszącego — pole "from" w nagłówku. */
  petitionerName: string
  /** Adres wnoszącego — pole "from". */
  petitionerAddress: string
  /** Miasto + data — pole top-right. */
  city?: string
  date?: string // ISO yyyy-mm-dd
}

const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
]

function formatPolishDate(iso: string | undefined): string {
  if (!iso) return '_______________'
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  const year = m[1]!
  const month = MONTHS[Number(m[2]) - 1] ?? m[2]!
  const day = String(Number(m[3]))
  return `${day} ${month} ${year} r.`
}

export function letterToMarkdown(
  letter: LetterResponse,
  ctx: LetterRenderContext,
): string {
  const cityDate = `${ctx.city ?? '_______________'}, ${formatPolishDate(ctx.date)}`

  const podstawy = letter.podstawy_prawne
    .map((p) => `- **${p.akt}** ${p.artykul} — ${p.tresc_skrocona}`)
    .join('\n')

  const argumenty = letter.argumentacja
    .map(
      (a) =>
        `## ${a.punkt}. ${a.naglowek}\n\n${a.tresc}\n\n*Podstawa prawna: ${a.podstawa}*`,
    )
    .join('\n\n')

  const wnioski = letter.wnioski.map((w, i) => `${i + 1}. ${w}`).join('\n')

  const ostrzezenia =
    letter.ostrzezenia.length > 0
      ? `\n\n> **Uwagi:**\n>\n${letter.ostrzezenia.map((o) => `> - ${o}`).join('\n')}`
      : ''

  return `${ctx.petitionerName}
${ctx.petitionerAddress}

${cityDate}

**${letter.do_organu}**

# ${letter.tytul}

## Podstawa prawna

${podstawy}

## Uzasadnienie

${argumenty}

## Wnioski

${wnioski}

---

Z poważaniem,

_______________________
*${ctx.petitionerName}*${ostrzezenia}
`
}
