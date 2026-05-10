import Link from 'next/link'
import type { Metadata } from 'next'

import { Button } from '@mandatomat/ui/button'

import { CtaFooter } from '@/components/marketing/cta-footer'
import { HowItWorks } from '@/components/marketing/how-it-works'

export const metadata: Metadata = {
  title: 'Jak to działa',
  description:
    'Krok po kroku: wgraj zdjęcie mandatu, odpowiedz na 5 pytań, pobierz gotowe odwołanie w PDF. Średnio 3 minuty.',
}

const DETAILS = [
  {
    n: '01',
    title: 'Wgraj zdjęcie lub PDF mandatu',
    desc: 'Akceptujemy JPG, PNG, HEIC i PDF do 10 MB. Działa z fotografią telefoniczną, skanem, lub PDF-em z mObywatela. AI-OCR wyciągnie datę, kwotę, art. KW, numer mandatu, dane organu i Twoje dane.',
    detail: 'Czas: ~10 sekund.',
  },
  {
    n: '02',
    title: 'Odpowiedz na pytania kreatora',
    desc: 'Algorytm dopasowuje pytania do Twojego typu mandatu. Pytamy tylko o to, co realnie wpływa na podstawy prawne odwołania — np. czy znak był zasłonięty, czy fotoradar miał aktualne świadectwo wzorcowania, czy mandat został doręczony prawidłowo.',
    detail: 'Średnio 5–8 pytań.',
  },
  {
    n: '03',
    title: 'AI generuje argumentację',
    desc: 'Claude (Anthropic) na bazie 100+ podstaw prawnych z Kodeksu Wykroczeń, KPA, Prawa o ruchu drogowym i bieżącego orzecznictwa SN/NSA tworzy spersonalizowane odwołanie. Każdy argument poparty cytatem z ustawy.',
    detail: 'Czas: ~30 sekund.',
  },
  {
    n: '04',
    title: 'Sprawdzasz scoring szans',
    desc: 'Pokazujemy uczciwą ocenę: 67% / 76% / 89% — w zależności od typu i okoliczności. Jeśli szanse są niskie (<40%), ostrzegamy i sugerujemy alternatywę (np. raty, prośba o umorzenie z innych powodów).',
    detail: 'Bez ściemy. Bez fałszywych obietnic.',
  },
  {
    n: '05',
    title: 'Pobierasz PDF i wysyłasz',
    desc: 'Gotowe pismo w formacie urzędowym — z numerem sprawy, podstawami prawnymi, polami na podpis i adresem zwrotnym. Wydruk, podpis, list polecony. Lub e-mail (gdy organ akceptuje).',
    detail: 'Tracker terminów przypomni o wysłaniu.',
  },
] as const

export default function JakToDzialaPage() {
  return (
    <>
      <section className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
        <div className="mx-auto max-w-prose px-6">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            JAK TO DZIAŁA
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-iron-950 sm:text-6xl dark:text-white">
            Od zdjęcia mandatu do gotowego pisma — w 5 krokach.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-iron-600 dark:text-iron-300">
            Cały proces zajmuje średnio 3 minuty. Bez wiedzy prawnej, bez wizyty u prawnika, bez
            wychodzenia z domu.
          </p>
        </div>
      </section>

      <HowItWorks />

      <section className="border-b border-iron-100 bg-white py-20 dark:border-iron-900 dark:bg-iron-950">
        <div className="mx-auto max-w-prose px-6">
          <h2 className="mb-12 font-display text-3xl font-extrabold tracking-[-0.03em] text-iron-950 dark:text-white">
            Szczegółowo, krok po kroku
          </h2>
          <ol className="space-y-10">
            {DETAILS.map((step) => (
              <li key={step.n} className="grid gap-6 md:grid-cols-[80px_1fr]">
                <span className="font-mono text-2xl font-bold tabular-nums text-precision-blue-600 dark:text-precision-blue-400">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-iron-600 dark:text-iron-300">{step.desc}</p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-wider text-iron-500">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 rounded-xl border border-precision-blue-200 bg-precision-blue-50 p-8 dark:border-precision-blue-800 dark:bg-precision-blue-950/30">
            <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
              Gotowy żeby zacząć?
            </h3>
            <p className="mt-2 text-iron-700 dark:text-iron-300">
              Zaczynasz za darmo — płacisz tylko gdy zdecydujesz się pobrać gotowe pismo.
            </p>
            <Button asChild size="lg" variant="primary" className="mt-5">
              <Link href="/kreator">Zacznij pisać odwołanie →</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaFooter />
    </>
  )
}
