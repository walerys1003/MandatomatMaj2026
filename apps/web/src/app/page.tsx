import Link from 'next/link'

import { Badge, Button, Card, CardContent, CardDescription, CardTitle, StatusBadge } from '@mandatomat/ui'
import { CASE_CATEGORY_LABELS } from '@mandatomat/db-types'

/**
 * Landing — placeholder hero do czasu pełnej implementacji w Tier 2/3.
 *
 * Implementacja zgodna z chunkami:
 *  - D03_hero_section (kompozycja hero, copy)
 *  - D04_kategorie_pism (lista kategorii / 34 typy spraw)
 *  - D02_typografia_layout (kontener 1320px, sekcja py-100)
 *
 * Pełny landing wraz z CTA, formularzem, zaufaniem społecznym i FAQ
 * powstanie w Tier 2 (T12_frontend_landing_dynamic_form).
 */
export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-landing px-6 py-[100px]">
      <section className="flex flex-col items-start gap-8">
        <Badge variant="info" mono>
          v0.1 · foundation
        </Badge>

        <h1 className="font-display text-h1 text-iron-900 dark:text-iron-50">
          Odwołanie od mandatu
          <br />
          <span className="text-precision-blue-600">w 5 minut.</span>
        </h1>

        <p className="max-w-prose text-lg text-iron-600 dark:text-iron-300">
          Mandatomat generuje profesjonalne odwołania od mandatów drogowych,
          parkingowych, e-TOLL, ZTM/MPK, windykacji i ubezpieczeń. Bez prawnika.
          Bez wzorów z internetu. Sztuczna inteligencja + 200+ podstaw prawnych.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" variant="primary">
            <Link href="/kreator">Zacznij odwołanie</Link>
          </Button>
          <Button asChild size="lg" variant="secondary-soft">
            <Link href="/cennik">Zobacz cennik</Link>
          </Button>
        </div>
      </section>

      <section className="mt-[100px] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(CASE_CATEGORY_LABELS).slice(0, 4).map(([key, label]) => (
          <Card key={key} interactive>
            <CardTitle className="text-h4">{label}</CardTitle>
            <CardDescription>
              Wczytaj zdjęcie mandatu, odpowiedz na 3-4 pytania, pobierz pismo PDF.
            </CardDescription>
            <CardContent className="mt-2">
              <StatusBadge status="ready" />
              <span className="font-mono text-xs text-iron-500">MND-{key.toUpperCase()}</span>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
