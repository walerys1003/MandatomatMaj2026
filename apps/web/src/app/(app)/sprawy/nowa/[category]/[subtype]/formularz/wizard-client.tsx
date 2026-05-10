'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import type { CaseType, FormData, FormSchema } from '@mandatomat/db-types'
import { Alert, DynamicForm } from '@mandatomat/ui'

interface WizardClientProps {
  caseType: CaseType
  title: string
  schema: FormSchema
  price: number
}

/**
 * Client wrapper dla DynamicForm — submit POST /api/cases.
 * Po sukcesie redirect → /sprawy/[caseId]/podglad.
 */
export function WizardClient({ caseType, title, schema, price }: WizardClientProps) {
  const router = useRouter()
  const [isSubmitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseType,
          formData: data,
          formSchemaVersion: schema.version,
        }),
      })

      const payload = (await res.json().catch(() => ({}))) as {
        case?: { id: string }
        error?: string
      }

      if (!res.ok || !payload.case?.id) {
        throw new Error(payload.error ?? `Błąd ${res.status}`)
      }

      // Sukces — przejście do podglądu (gdzie nastąpi generowanie pisma)
      router.push(`/sprawy/${payload.case.id}/podglad`)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Nieznany błąd'
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <>
      {error ? (
        <div className="mb-6">
          <Alert variant="danger" title="Nie udało się utworzyć sprawy">
            {error}
          </Alert>
        </div>
      ) : null}

      <DynamicForm
        title={title}
        schema={schema}
        extraSteps={['Podgląd', 'Płatność']}
        storageKey={`${caseType}:new`}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={`Dalej → Podgląd (${price} zł)`}
      />
    </>
  )
}
