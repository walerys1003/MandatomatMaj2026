import { z } from 'zod'

import type { FormField, FormStep } from '@mandatomat/db-types'

/**
 * Buduje dynamicznie schemat Zod dla pojedynczego kroku formularza.
 *
 * Wsparcie:
 *  - text/email/tel/textarea  → z.string()
 *  - number/money             → z.coerce.number()
 *  - date                     → z.string() (ISO yyyy-mm-dd, walidacja regex)
 *  - select/radio             → z.string() (lub enum z opcji)
 *  - checkbox                 → z.boolean()
 *  - checklist                → z.array(z.string())
 *  - file                     → z.string() (URL/path do uploads.id)
 *
 * Walidatory `min/max/minLength/maxLength/pattern` z `field.validation`
 * oraz `required: true/false`.
 *
 * Pola warunkowe (`conditionalOn`) — sprawdzane na poziomie engine
 * (`isFieldVisible`); w Zod schemie zawsze są opcjonalne, walidacja "required"
 * dzieje się tylko po stronie engine gdy pole jest widoczne.
 */

function baseStringSchema(field: FormField): z.ZodTypeAny {
  // Najpierw konfigurujemy ZodString (min/max), potem ewentualnie refine — refine
  // zwraca ZodEffects, więc musi być ostatnim krokiem łańcucha.
  let zStr: z.ZodString = z.string()
  if (field.validation?.minLength != null) {
    zStr = zStr.min(field.validation.minLength, `Minimum ${field.validation.minLength} znaków`)
  }
  if (field.validation?.maxLength != null) {
    zStr = zStr.max(field.validation.maxLength, `Maksimum ${field.validation.maxLength} znaków`)
  }
  if (field.validation?.pattern) {
    const re = new RegExp(field.validation.pattern)
    return zStr.refine((v) => re.test(v), {
      message: field.validation.patternMessage ?? 'Nieprawidłowy format',
    })
  }
  return zStr
}

function baseNumberSchema(field: FormField): z.ZodTypeAny {
  let n = z.coerce.number({ invalid_type_error: 'Wprowadź liczbę' })
  if (field.validation?.min != null) {
    n = n.min(field.validation.min, `Minimum ${field.validation.min}`)
  }
  if (field.validation?.max != null) {
    n = n.max(field.validation.max, `Maksimum ${field.validation.max}`)
  }
  return n
}

function buildFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (field.type) {
    case 'text':
    case 'tel':
    case 'textarea':
      schema = baseStringSchema(field)
      break
    case 'email':
      schema = z.string().email('Nieprawidłowy adres e-mail')
      break
    case 'date':
      schema = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowa data (wymagany format YYYY-MM-DD)')
      break
    case 'number':
    case 'money':
      schema = baseNumberSchema(field)
      break
    case 'select':
    case 'radio':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]]
        schema = z.enum(values, { invalid_type_error: 'Wybierz jedną z opcji' })
      } else {
        schema = baseStringSchema(field)
      }
      break
    case 'checkbox':
      schema = z.coerce.boolean()
      break
    case 'checklist':
      schema = z.array(z.string()).default([])
      break
    case 'file':
      schema = z.string()
      break
    default:
      schema = z.unknown()
  }

  // Pola warunkowe są zawsze optional na poziomie Zod; engine waliduje wymagalność
  // dopiero gdy pole jest widoczne. Dla nie-warunkowych pól: required → tak/nie.
  const isConditional = !!field.conditionalOn
  if (isConditional || !field.required) {
    // optional + nullable, bo input może wracać "" / null / undefined
    schema = schema.optional().or(z.literal('')).or(z.null())
  } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'tel') {
    // wymagane stringi: dodaj min(1)
    schema = (schema as z.ZodString).min(1, 'To pole jest wymagane')
  } else if (field.type === 'select' || field.type === 'radio') {
    // wymagane enum-y: refine że nie jest pusty
    schema = z
      .string({ required_error: 'Wybierz jedną z opcji' })
      .min(1, 'Wybierz jedną z opcji')
      .pipe(schema as z.ZodTypeAny)
  }

  return schema
}

/**
 * Buduje pełny obiektowy schemat dla wszystkich pól w danym kroku.
 *
 * UWAGA: Pola warunkowe są w schemie jako optional. Walidacja "wymagane gdy
 * widoczne" odbywa się przed `form.handleSubmit` w `DynamicForm`.
 */
export function buildStepSchema(step: FormStep): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {}
  for (const field of step.fields) {
    shape[field.name] = buildFieldSchema(field)
  }
  return z.object(shape)
}
