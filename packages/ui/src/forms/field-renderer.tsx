'use client'

import { Sparkles } from 'lucide-react'
import * as React from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import type { FormField } from '@mandatomat/db-types'

import { Checkbox } from '../components/checkbox'
import { Input, Label } from '../components/input'
import { Select } from '../components/select'
import { Textarea } from '../components/textarea'
import { cn } from '../lib/cn'

/**
 * <FieldRenderer> — switch po `field.type`, renderuje odpowiedni input
 * z `react-hook-form` i komunikatami błędów.
 *
 * AI-suggested options w `select/radio` mają ikonę sparkle 14px blue-400
 * + tooltip (chunk D07).
 */

interface FieldRendererProps<T extends FieldValues = FieldValues> {
  field: FormField
  form: UseFormReturn<T>
  className?: string
}

export function FieldRenderer<T extends FieldValues = FieldValues>({
  field,
  form,
  className,
}: FieldRendererProps<T>) {
  const error = form.formState.errors[field.name]
  const errorMessage = (error?.message as string | undefined) ?? null

  const widthClass = field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2'

  return (
    <div className={cn('flex flex-col gap-1.5', widthClass, className)}>
      <Label htmlFor={field.name}>
        {field.label}
        {field.required ? (
          <span aria-hidden className="ml-1 text-signal-600">
            *
          </span>
        ) : null}
      </Label>

      {renderInput(field, form, errorMessage !== null)}

      {field.helpText && !errorMessage ? (
        <p className="text-xs text-iron-500">{field.helpText}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-xs font-medium text-signal-600 dark:text-signal-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

function renderInput<T extends FieldValues>(
  field: FormField,
  form: UseFormReturn<T>,
  invalid: boolean,
): React.ReactNode {
  const reg = form.register(field.name as never)
  const id = field.name

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <Input
          id={id}
          type={field.type}
          placeholder={field.placeholder}
          invalid={invalid}
          autoComplete="off"
          {...reg}
        />
      )

    case 'date':
      return <Input id={id} type="date" invalid={invalid} {...reg} />

    case 'number':
      return (
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          placeholder={field.placeholder}
          invalid={invalid}
          {...reg}
        />
      )

    case 'money':
      return (
        <div className="relative">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder={field.placeholder ?? '0,00'}
            invalid={invalid}
            className="pr-12"
            {...reg}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-wider text-iron-500">
            zł
          </span>
        </div>
      )

    case 'textarea':
      return (
        <Textarea
          id={id}
          rows={4}
          placeholder={field.placeholder}
          invalid={invalid}
          maxLength={field.validation?.maxLength}
          {...reg}
        />
      )

    case 'select':
      return (
        <Select id={id} invalid={invalid} {...reg}>
          <option value="">— wybierz —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.aiSuggested ? '✨ ' : ''}
              {opt.label}
            </option>
          ))}
        </Select>
      )

    case 'radio':
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-iron-200 bg-white p-3 transition-colors duration-150 hover:border-precision-blue-200 has-[:checked]:border-precision-blue-500 has-[:checked]:bg-precision-blue-50 dark:border-iron-800 dark:bg-iron-900 dark:hover:border-precision-blue-700 dark:has-[:checked]:border-precision-blue-500 dark:has-[:checked]:bg-precision-blue-950"
            >
              <input
                type="radio"
                value={opt.value}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-precision-blue-600"
                {...reg}
              />
              <span className="flex flex-1 items-center gap-2 text-sm text-iron-900 dark:text-iron-100">
                {opt.aiSuggested ? (
                  <Sparkles
                    aria-hidden
                    className="h-3.5 w-3.5 flex-shrink-0 text-precision-blue-400"
                  />
                ) : null}
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )

    case 'checkbox':
      return <Checkbox id={id} label={field.placeholder ?? field.label} {...reg} />

    case 'checklist':
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-iron-200 bg-white p-3 transition-colors duration-150 hover:border-precision-blue-200 has-[:checked]:border-precision-blue-500 has-[:checked]:bg-precision-blue-50 dark:border-iron-800 dark:bg-iron-900"
            >
              <input
                type="checkbox"
                value={opt.value}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-precision-blue-600"
                {...form.register(field.name as never)}
              />
              <span className="text-sm text-iron-900 dark:text-iron-100">{opt.label}</span>
            </label>
          ))}
        </div>
      )

    case 'file':
      // Upload file → osobny komponent <FileUpload />, który po sukcesie wstawia
      // upload_id (UUID) do `form.setValue(field.name, upload_id)`.
      // Tutaj fallback inputu — właściwy upload obsługuje OcrUploader.
      return (
        <input
          id={id}
          type="file"
          accept="image/*,application/pdf"
          className="block w-full text-sm text-iron-700 file:mr-3 file:rounded-md file:border-0 file:bg-precision-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-precision-blue-700 hover:file:bg-precision-blue-100 dark:text-iron-300"
        />
      )

    default:
      return <Input id={id} type="text" invalid={invalid} {...reg} />
  }
}
