'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import type { CaseType, FormData, FormSchema } from '@mandatomat/db-types'
import {
  Alert,
  DynamicForm,
  OcrUploader,
  type OcrParsedDocument,
} from '@mandatomat/ui'

interface WizardClientProps {
  caseType: CaseType
  title: string
  schema: FormSchema
  price: number
  /** Hint dla AI vision (np. „mandat za prędkość"). */
  ocrHint?: string
}

/**
 * Client wrapper dla DynamicForm — submit POST /api/cases.
 *
 * Slot OCR przed formularzem: po sukcesie auto-fill `ocrData` przekazany do
 * <DynamicForm>, który użyje go zgodnie z `field.autoFillFromOcr` w schemie.
 * Po sukcesie submitu → redirect → /sprawy/[caseId]/podglad.
 */
export function WizardClient({
  caseType,
  title,
  schema,
  price,
  ocrHint,
}: WizardClientProps) {
  const router = useRouter()
  const [isSubmitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ocrData, setOcrData] = React.useState<Record<string, unknown> | undefined>(
    undefined,
  )
  const [ocrApplied, setOcrApplied] = React.useState(false)

  function handleOcrParsed(parsed: OcrParsedDocument) {
    // Mergujemy: pola z `parsed.fields` + raw_text + meta — DynamicForm sam
    // wybierze co użyć przez `autoFillFromOcr` w schema.
    const merged: Record<string, unknown> = {
      ...parsed.fields,
      _ocr_raw_text: parsed.raw_text,
      _ocr_document_type: parsed.document_type,
      _ocr_confidence: parsed.confidence,
    }
    setOcrData(merged)
    setOcrApplied(true)
  }

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

      {/* Slot OCR — opcjonalny krok przed formularzem */}
      <div className="mb-8 rounded-xl border border-iron-200 bg-white p-6 dark:border-iron-800 dark:bg-iron-900">
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
            Masz zdjęcie dokumentu? <span className="text-iron-400">(opcjonalnie)</span>
          </h2>
          <p className="mt-1 text-sm text-iron-600 dark:text-iron-400">
            Wgraj zdjęcie mandatu / wezwania — AI rozpozna pola i wypełni formularz za Ciebie.
            Pominiesz przepisywanie numerów.
          </p>
        </div>

        {ocrApplied ? (
          <Alert variant="success" title="Dane uzupełnione z dokumentu">
            <div className="flex items-center justify-between gap-3">
              <span>
                Sprawdź pola formularza poniżej i popraw, jeśli AI źle odczytał. Możesz też wgrać
                kolejne zdjęcie.
              </span>
              <button
                type="button"
                onClick={() => {
                  setOcrApplied(false)
                  setOcrData(undefined)
                }}
                className="shrink-0 text-sm font-medium text-precision-blue-700 hover:underline"
              >
                Wgraj inne
              </button>
            </div>
          </Alert>
        ) : (
          <OcrUploader
            hint={ocrHint ?? title}
            onParsed={handleOcrParsed}
            helperText="Akceptujemy JPEG/PNG/WebP do 10 MB. AI używa Claude vision — średnio 10–20 s na rozpoznanie."
          />
        )}
      </div>

      <DynamicForm
        title={title}
        schema={schema}
        extraSteps={['Podgląd', 'Płatność']}
        storageKey={`${caseType}:new`}
        ocrData={ocrData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={`Dalej → Podgląd (${price} zł)`}
      />
    </>
  )
}
