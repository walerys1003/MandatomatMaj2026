# 4.3-4.4 Typografia (Inter Tight, Inter, JetBrains Mono) + Layout

**Chunk ID:** `D02_typografia_layout`
**Source:** design (lines 96-130)
**Tags:** design, typografia, inter_tight, jetbrains, layout, spacing
**Target Agents:** design, frontend

---

4.3 TYPOGRAFIA
Display — Inter Tight
Agent AI: ŻADEN serif. Mandatomat używa Inter Tight jako display — zmodyfikowany Inter z tighter spacing i wyraźniejszym geometrycznym charakterem. Komunikuje: system, interfejs, narzędzie. Jeśli Inter Tight nie jest dostępny, użyj Inter z font-weight: 800 i letter-spacing: -0.04em.
import { Inter_Tight } from 'next/font/google';

const displayFont = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

Parametry: H1: 52px / line-height 1.0 / letter-spacing -0.04em / weight 800. H2: 36px / 1.08 / -0.03em / 700. H3: 24px / 1.15 / -0.02em / 700. H4: 18px / 1.25 / -0.01em / 600.
Letter-spacing jest NAJBARDZIEJ NEGATYWNY ze wszystkich SaaS-ów (-0.04em w H1). Litery są ściśnięte, gęste, kompaktowe. Efekt: nagłówki wyglądają jak wygrawerowane w metalu. Siła, precyzja, zero luzu.
Interface — Inter
Standardowy Inter 16px / 1.6 / 400. Ale w Mandatomacie więcej elementów ma weight 500 niż w innych SaaS-ach — labels, meta dane, opisy w kartach. Weight 500 (medium) daje wrażenie gęstości informacji bez agresji bolda. Tabular nums (font-feature-settings: "tnum") na kwotach mandatów, datach, numerach spraw.
Mono — JetBrains Mono
Rozszerzone użycie (jak w Długomacie): numery mandatów, sygnatury, kwoty, daty, numery spraw. Ale w Mandatomacie mono pojawia się CZĘŚCIEJ — w badge’ach statusów, w tagach kategorii, w headerach kart spraw. To wzmacnia wrażenie „systemowego interfejsu".
4.4 LAYOUT — SPECYFIKA MANDATOMAT
Landing page kontener: 1320px (NAJSZERSZY — więcej treści)
Dashboard content: 1140px (NAJSZERSZY dashboard)
Formularz wizarda: 560px (NAJWĘŻSZY — krótkie formularze, mniej pól)
Max-width paragrafów: 480px (zwarte)

Sekcje landing: padding-y 100px (NAJKRÓTSZY padding — gęsto)
Gap między kartami: 16px (NAJKRÓTSZY gap — więcej kart na ekranie)
Padding wewnątrz kart: 24px (NAJKRÓTSZY — kompaktowe)
Gap pola formularza: 16px

Agent AI: Mandatomat jest GĘSTSZY od innych SaaS-ów. 
Mniej whitespace, więcej danych, bliżej do siebie. 
To nie blog — to narzędzie. Bloomberg, nie Medium.

4.5 HERO SECTION — PIXEL-PERFECT INSTRUKCJA
Sekcja hero: