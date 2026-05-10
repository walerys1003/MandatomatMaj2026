import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  CATEGORIES,
  caseTypeUrlSlug,
  getCategory,
  getCaseTypeBySlug,
  getCaseTypesByCategory,
  loadFormSchema,
} from '@/lib/cases/catalog'

import { WizardClient } from './wizard-client'

interface PageProps {
  params: { category: string; subtype: string }
}

export function generateStaticParams() {
  const out: Array<{ category: string; subtype: string }> = []
  for (const cat of CATEGORIES) {
    const types = getCaseTypesByCategory(cat.id).filter((t) => t.mvp)
    for (const t of types) {
      out.push({ category: cat.slug, subtype: caseTypeUrlSlug(t) })
    }
  }
  return out
}

export function generateMetadata({ params }: PageProps): Metadata {
  const meta = getCaseTypeBySlug(params.category, params.subtype)
  if (!meta) return { title: 'Nieznany typ pisma' }
  return {
    title: `${meta.title} — formularz`,
    description: meta.description,
  }
}

/**
 * Krok 2 wizarda — formularz zależny od typu pisma.
 *
 * Server Component → ładuje schema (lazy import), przekazuje do
 * <WizardClient> który renderuje <DynamicForm>.
 */
export default async function FormularzPage({ params }: PageProps) {
  const cat = getCategory(params.category)
  const meta = getCaseTypeBySlug(params.category, params.subtype)
  if (!cat || !meta || !meta.mvp) notFound()

  const schema = await loadFormSchema(meta.type)
  if (!schema) notFound()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-iron-500">
        <Link
          href={`/sprawy/nowa/${cat.slug}`}
          className="hover:text-precision-blue-600 hover:underline"
        >
          ← {cat.title}
        </Link>
      </nav>

      <WizardClient
        caseType={meta.type}
        title={`${meta.shortId} · ${meta.title}`}
        schema={schema}
        price={meta.price}
      />
    </div>
  )
}
