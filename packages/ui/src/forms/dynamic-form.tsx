'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { isFieldVisible, type FormData, type FormSchema } from '@mandatomat/db-types'

import { Button } from '../components/button'
import { Spinner } from '../components/spinner'
import { Stepper } from '../components/stepper'
import { cn } from '../lib/cn'

import { FieldRenderer } from './field-renderer'
import { buildStepSchema } from './zod-builder'

/**
 * <DynamicForm> — silnik wizarda Mandatomatu (chunk T12 + D07).
 *
 * Cechy:
 *  - Renderuje pola na podstawie `FormSchema` (z bazy `case_type_config.form_schema`).
 *  - Pola warunkowe (`conditionalOn`) — pokazują się dopiero gdy zależność spełniona.
 *  - Auto-fill z `ocrData` (np. numer mandatu z OCR).
 *  - Walidacja per krok (Zod) — nie można przejść dalej bez wymaganych pól.
 *  - Persistencja draftu w `localStorage` (klucz `mm:draft:<storageKey>`) co 2s.
 *  - Stepper breadcrumb tabs ("RODZAJ" | "DANE" | "PODGLĄD" | "PŁATNOŚĆ" — D07).
 *  - Submit: gdy ostatni krok schemy → callback `onSubmit(allData)`.
 *
 * Mandatomat ma typowo schemę 1-2 kroków danych; preview/payment są poza schemą
 * (renderowane przez właściwe strony `/sprawy/[caseId]/podglad` i `/zaplata`).
 * Dlatego komponent przyjmuje `extraSteps` żeby Stepper pokazywał pełną
 * sekwencję 4-tabową, nawet jeśli schema ma tylko 1-2 kroków danych.
 */

export interface DynamicFormProps {
  schema: FormSchema
  /** Opcjonalne dodatkowe taby w Stepperze (np. ['Podgląd', 'Płatność']). */
  extraSteps?: string[]
  /** Dane z OCR — auto-fill defaultValue jeśli `field.autoFillFromOcr` zdefiniowane. */
  ocrData?: Record<string, unknown>
  /** Wartości startowe (wczytane z bazy / draftu). */
  initialData?: FormData
  /** Klucz dla `localStorage` — typowo case_id albo `${case_type}:new`. */
  storageKey?: string
  /** Callback po przejściu wszystkich kroków. */
  onSubmit: (data: FormData) => void | Promise<void>
  /** Loading state dla submit (np. "Generuj pismo"). */
  isSubmitting?: boolean
  /** Tekst przycisku submit dla ostatniego kroku. Default: "Dalej →". */
  submitLabel?: string
  /** Tytuł sprawy (góra wizarda — chunk D07 top bar). */
  title?: string
  className?: string
}

const DRAFT_DEBOUNCE_MS = 2000

function loadDraft(storageKey?: string): FormData | null {
  if (!storageKey || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`mm:draft:${storageKey}`)
    if (!raw) return null
    return JSON.parse(raw) as FormData
  } catch {
    return null
  }
}

function saveDraft(storageKey: string, data: FormData) {
  try {
    window.localStorage.setItem(`mm:draft:${storageKey}`, JSON.stringify(data))
  } catch {
    /* noop */
  }
}

function clearDraft(storageKey: string) {
  try {
    window.localStorage.removeItem(`mm:draft:${storageKey}`)
  } catch {
    /* noop */
  }
}

function buildDefaults(
  schema: FormSchema,
  ocrData: Record<string, unknown> | undefined,
  initialData: FormData | undefined,
  draft: FormData | null,
): FormData {
  const merged: FormData = {}
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (initialData && field.name in initialData) {
        merged[field.name] = initialData[field.name]!
        continue
      }
      if (draft && field.name in draft) {
        merged[field.name] = draft[field.name]!
        continue
      }
      if (field.autoFillFromOcr && ocrData && field.autoFillFromOcr in ocrData) {
        const v = ocrData[field.autoFillFromOcr]
        if (v != null) {
          merged[field.name] = v as never
          continue
        }
      }
      if (field.defaultValue !== undefined) {
        merged[field.name] = field.defaultValue as never
      } else {
        // wartość domyślna kontrolowanego inputu
        if (field.type === 'checkbox') merged[field.name] = false
        else if (field.type === 'checklist') merged[field.name] = []
        else if (field.type === 'number' || field.type === 'money') merged[field.name] = ''
        else merged[field.name] = ''
      }
    }
  }
  return merged
}

export function DynamicForm({
  schema,
  extraSteps,
  ocrData,
  initialData,
  storageKey,
  onSubmit,
  isSubmitting,
  submitLabel,
  title,
  className,
}: DynamicFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const totalDataSteps = schema.steps.length

  // Draft tylko raz przy mount (żeby nie nadpisywać po edycji)
  const draftRef = React.useRef<FormData | null>(null)
  if (draftRef.current === null) {
    draftRef.current = loadDraft(storageKey)
  }

  const stepSchema = React.useMemo(
    () => buildStepSchema(schema.steps[currentStep]!),
    [schema, currentStep],
  )

  const defaults = React.useMemo(
    () => buildDefaults(schema, ocrData, initialData, draftRef.current),
    [schema, ocrData, initialData],
  )

  const form = useForm<FormData>({
    resolver: zodResolver(stepSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  })

  // Persystencja draftu — debounce 2s
  React.useEffect(() => {
    if (!storageKey) return
    const sub = form.watch((value) => {
      const handle = setTimeout(() => {
        saveDraft(storageKey, value as FormData)
      }, DRAFT_DEBOUNCE_MS)
      return () => clearTimeout(handle)
    })
    return () => sub.unsubscribe()
  }, [form, storageKey])

  // Stepper steps: dane steps + extra (preview/payment) — obiekty {id, label}
  const stepperLabels = React.useMemo(
    () => [
      ...schema.steps.map((s, idx) => ({ id: `data-${idx}`, label: s.title })),
      ...(extraSteps ?? []).map((label, idx) => ({ id: `extra-${idx}`, label })),
    ],
    [schema, extraSteps],
  )

  const currentStepData = schema.steps[currentStep]!
  const allData = form.watch()

  // Filtrujemy pola widoczne (conditionalOn)
  const visibleFields = currentStepData.fields.filter((f) => isFieldVisible(f, allData))

  const isLastDataStep = currentStep === totalDataSteps - 1

  async function handleNext() {
    // Walidacja TYLKO widocznych pól
    const fieldNames = visibleFields.map((f) => f.name)
    const ok = await form.trigger(fieldNames as never)
    if (!ok) return

    // Wymagane pola warunkowe — Zod sam tego nie złapie (są optional w schemie)
    for (const f of visibleFields) {
      if (f.required) {
        const v: unknown = form.getValues(f.name as never)
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
          form.setError(f.name as never, { type: 'manual', message: 'To pole jest wymagane' })
          return
        }
      }
    }

    if (isLastDataStep) {
      const data = form.getValues()
      // Sprzątamy puste klucze (nie-widoczne pola conditionalOn)
      const cleaned: FormData = {}
      for (const step of schema.steps) {
        for (const field of step.fields) {
          if (isFieldVisible(field, data)) {
            cleaned[field.name] = data[field.name] ?? null
          }
        }
      }
      if (storageKey) clearDraft(storageKey)
      await onSubmit(cleaned)
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  return (
    <div className={cn('mx-auto w-full max-w-wizard', className)}>
      {title ? (
        <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-wider text-iron-500">
          {title}
        </p>
      ) : null}

      <Stepper
        steps={stepperLabels}
        currentIndex={currentStep}
        completedThrough={currentStep - 1}
        className="mb-10"
      />

      <FormProvider {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleNext()
          }}
          className="space-y-6"
          noValidate
        >
          <header className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-iron-950 dark:text-white">
              {currentStepData.title}
            </h2>
            {currentStepData.description ? (
              <p className="text-sm text-iron-600 dark:text-iron-300">
                {currentStepData.description}
              </p>
            ) : null}
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {visibleFields.map((field) => (
              <FieldRenderer key={field.name} field={field} form={form} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-iron-100 pt-6 dark:border-iron-800">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              ← Wstecz
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!!isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 border-white/30 border-t-white" />
                  {isLastDataStep ? 'Generowanie…' : 'Walidacja…'}
                </>
              ) : isLastDataStep ? (
                (submitLabel ?? 'Generuj pismo')
              ) : (
                'Dalej →'
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
