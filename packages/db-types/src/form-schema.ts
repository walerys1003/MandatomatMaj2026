/**
 * Form Schema — typy współdzielone między backendem (case_type_config.form_schema JSONB)
 * a frontendem (DynamicForm engine).
 *
 * Źródło: chunk T12 (sekcja 5.2 Dynamiczny formularz — silnik) +
 *         chunk D07 (Wizard — krok 2 dane).
 *
 * KAŻDY typ pisma (M1, M4, P1, P3, W1, ...) opisany JSON-em zgodnym z `FormSchema`
 * w bazie (kolumna `case_type_config.form_schema`). Frontend renderuje dowolny
 * formularz bez znajomości typu — to jest „silnik" Mandatomatu.
 */

export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'checklist'
  | 'file'
  | 'money'

export interface FormFieldOption {
  value: string
  label: string
  /** AI-suggested option — frontend pokazuje ikonę sparkle + tooltip (D07). */
  aiSuggested?: boolean
  /** Tekst tooltipa (jeśli inny niż domyślny). */
  hint?: string
}

export interface FormFieldValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  /** Regex jako string (Zod refinement w runtime). */
  pattern?: string
  /** Komunikat błędu dla pattern. */
  patternMessage?: string
}

export interface FormFieldConditional {
  /** Nazwa pola, od którego zależy widoczność. */
  field: string
  /** Wartość której równość powoduje pokazanie pola.
   *  Tablica = OR (np. powod_odwolania ∈ ['blad_pomiaru', 'inne']). */
  value: string | boolean | number | Array<string | boolean | number>
}

export interface FormField {
  /** Klucz w `cases.form_data` — np. "numer_mandatu". */
  name: string
  type: FormFieldType
  label: string
  placeholder?: string
  required?: boolean
  helpText?: string
  /** Dla select/radio/checklist. */
  options?: FormFieldOption[]
  validation?: FormFieldValidation
  /** Pole pokazywane warunkowo. */
  conditionalOn?: FormFieldConditional
  /** Klucz w `uploads.ocr_parsed_data`, z którego zassać domyślną wartość. */
  autoFillFromOcr?: string
  /** UI: szerokość (full | half). Default: full. */
  width?: 'full' | 'half'
  /** Default value (jeśli OCR niedostępne i brak draftu). */
  defaultValue?: string | number | boolean | string[]
}

export interface FormStep {
  /** Tytuł kroku — używany w Stepper i nagłówku. */
  title: string
  /** Krótki opis pod tytułem (opcjonalnie). */
  description?: string
  /** Pola w tym kroku. */
  fields: FormField[]
}

export interface FormSchema {
  /** Wersja schemy — musi rosnąć przy każdej zmianie (form_schema_versioning). */
  version: number
  /** Sekwencja kroków wizarda. Mandatomat ma typowo 2 kroki danych +
   *  3. preview + 4. payment (preview/payment generuje frontend, NIE są w schemie). */
  steps: FormStep[]
}

/** Wartość pola formularza. */
export type FormValue = string | number | boolean | string[] | null

/** Zebrane dane formularza (po wszystkich krokach). */
export type FormData = Record<string, FormValue>

/** Helper — czy pole powinno być widoczne w danym stanie formData. */
export function isFieldVisible(field: FormField, data: FormData): boolean {
  if (!field.conditionalOn) return true
  const current = data[field.conditionalOn.field]
  const expected = field.conditionalOn.value

  if (Array.isArray(expected)) {
    return expected.includes(current as never)
  }
  return current === expected
}
