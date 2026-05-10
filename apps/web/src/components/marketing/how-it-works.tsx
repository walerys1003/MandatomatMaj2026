/**
 * "Jak to działa" — 3 kroki w siatce 3-kolumnowej.
 * Każdy krok: numer (font-mono, blue-600), tytuł (display 800), opis.
 * Linia łącząca kroki na desktop (decorative).
 */

const STEPS = [
  {
    n: '01',
    title: 'Wgraj zdjęcie mandatu',
    desc: 'Zrób zdjęcie lub przeciągnij plik. AI odczyta dane w sekundę — datę, kwotę, podstawę prawną, art. KW.',
  },
  {
    n: '02',
    title: 'Odpowiedz na 5 pytań',
    desc: 'Krótki kreator dopasowany do Twojej sytuacji. Pytamy tylko o to, co zwiększy Twoje szanse na uchylenie.',
  },
  {
    n: '03',
    title: 'Pobierz gotowe odwołanie',
    desc: 'PDF z numerem sprawy, podstawami prawnymi i argumentacją. Wydrukuj, podpisz, wyślij listem poleconym.',
  },
] as const

export function HowItWorks() {
  return (
    <section className="border-b border-iron-100 bg-iron-50/50 dark:border-iron-900 dark:bg-iron-950">
      <div className="mx-auto max-w-landing px-6 py-24">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-precision-blue-600 dark:text-precision-blue-400">
            JAK TO DZIAŁA
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-iron-950 sm:text-5xl dark:text-white">
            Trzy kroki do gotowego odwołania.
          </h2>
        </div>

        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="group relative rounded-xl border border-iron-100 bg-white p-8 transition-all duration-150 hover:-translate-y-px hover:border-precision-blue-200 hover:shadow-lg dark:border-iron-800 dark:bg-iron-900 dark:hover:border-precision-blue-700"
            >
              <div className="mb-6 font-mono text-sm font-semibold tabular-nums text-precision-blue-600 dark:text-precision-blue-400">
                {step.n}
              </div>
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-iron-600 dark:text-iron-300">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
