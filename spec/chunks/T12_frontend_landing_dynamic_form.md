# 5. Frontend - Landing page + Dynamic Form engine

**Chunk ID:** `T12_frontend_landing_dynamic_form`
**Source:** tech (lines 2019-2206)
**Tags:** frontend, landing, dynamic_form, wizard, react_hook_form, zod
**Target Agents:** frontend, design

---


5. FRONTEND — KOMPONENTY I STRONY
5.1 Landing Page (marketing)
Struktura strony głównej (app/(marketing)/page.tsx):
1. HERO SECTION
   - Nagłówek: "Mandat? Parking? Windykacja?"
   - Podnagłówek: "Odwołaj się w 5 minut — bez prawnika."
   - Dwa CTA: "Sprawdź swoje szanse (za darmo)" | "Stwórz pismo →"
   - Animowany mockup telefonu z procesem generowania pisma
   - Trust badges: "12M+ spraw rocznie" | "3 min" | "76% skuteczność" | "od 79 zł"

2. JAK TO DZIAŁA (stepper)
   - Krok 1: Wybierz kategorię
   - Krok 2: Odpowiedz na pytania
   - Krok 3: AI generuje pismo
   - Krok 4: Pobierz PDF i wyślij
   - Animacja: formularz → spinner → dokument PDF

3. KATEGORIE SPRAW (grid 7 kart)
   - Mandaty karne (ikona ShieldAlert, kolor red)
   - Parking i komunikacja (Car, blue)
   - Windykacja i EPU (FileWarning, amber)
   - Ubezpieczenia OC/AC (Shield, green)
   - e-TOLL (Route, purple)
   - Kontrole (ScanSearch, orange)
   - Pisma techniczne (FileText, gray)
   - Każda karta: ikona + nazwa + "X+ typów pism" + "od Y zł"

4. SOCIAL PROOF
   - Liczniki: "12 345 wygenerowanych pism" | "76% skuteczność" | "4.8/5 ocena"
   - Testimoniale (3 karty z cytatami)
   - Loga mediów (jeśli są)

5. SCORING DEMO (interaktywny, [DARMOWE])
   - Mini-formularz: typ mandatu + opis + "Sprawdź szanse"
   - Wynik: gauge 0-100% z animacją + CTA do zakupu

6. CENNIK
   - 3 kolumny: Jednorazowe | Kierowca (29 zł/mies.) | PRO (nieokreślone V2)
   - Porównanie z prawnikiem: "Prawnik: 300-1500 zł → Mandatomat: od 79 zł. Oszczędność: 74-90%"

7. FAQ (accordion)
   - 8-10 pytań: Czy to legalne? Ile trwa? Jakie mam szanse? Co jeśli przegram? etc.

8. CTA FOOTER
   - "Nie czekaj. Termin biegnie." + duży przycisk "Stwórz odwołanie teraz"

9. FOOTER
   - Linki: Regulamin, Polityka prywatności, RODO, O nas, Blog, Kontakt
   - NIP, dane firmy, informacja o inkubatorze

5.2 Dynamiczny formularz — silnik (components/forms/dynamic-form.tsx)
To jest serce aplikacji. Jeden komponent renderuje formularze dla WSZYSTKICH 34 typów spraw, na podstawie konfiguracji JSON (form_schema w case_type_config).
// components/forms/dynamic-form.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from './file-upload'
import { Stepper } from '@/components/shared/stepper'

// Schema pola formularza (z bazy danych)
interface FormField {
    name: string
    type: 'text' | 'number' | 'date' | 'email' | 'tel' | 'textarea' |
          'select' | 'radio' | 'checkbox' | 'checklist' | 'file' | 'money'
    label: string
    placeholder?: string
    required?: boolean
    helpText?: string
    options?: { value: string; label: string }[]   // Dla select, radio, checklist
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
    conditionalOn?: {                              // Wyświetl pole warunkowo
        field: string
        value: string | boolean
    }
    step?: number                                  // Krok w wizardzie (1, 2, 3...)
    section?: string                               // Sekcja wizualna
    autoFillFromOcr?: string                       // Klucz z OCR parsed data
}

interface FormSchema {
    steps: {
        title: string
        description?: string
        fields: FormField[]
    }[]
}

interface DynamicFormProps {
    schema: FormSchema
    ocrData?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void
    isSubmitting?: boolean
    initialData?: Record<string, any>
}

export function DynamicForm({ schema, ocrData, onSubmit, isSubmitting, initialData }: DynamicFormProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const totalSteps = schema.steps.length

    // Build Zod schema dynamically
    const zodSchema = buildZodSchema(schema.steps[currentStep].fields)
    
    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues: buildDefaultValues(schema.steps[currentStep].fields, ocrData, initialData),
    })

    const currentFields = schema.steps[currentStep].fields

    const handleNext = form.handleSubmit((data) => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Zbierz dane ze wszystkich kroków
            onSubmit(data)
        }
    })

    return (
        <div className="max-w-2xl mx-auto">
            <Stepper
                steps={schema.steps.map(s => s.title)}
                currentStep={currentStep}
                className="mb-8"
            />

            <Card>
                <CardHeader>
                    <CardTitle>{schema.steps[currentStep].title}</CardTitle>
                    {schema.steps[currentStep].description && (
                        <p className="text-muted-foreground text-sm">
                            {schema.steps[currentStep].description}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleNext} className="space-y-6">
                        {currentFields.map(field => (
                            <FieldRenderer
                                key={field.name}
                                field={field}
                                form={form}
                                ocrData={ocrData}
                            />
                        ))}

                        <div className="flex justify-between pt-4">
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                >
                                    ← Wstecz
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="ml-auto"
                            >
                                {currentStep < totalSteps - 1 ? 'Dalej →' : 'Generuj pismo'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
