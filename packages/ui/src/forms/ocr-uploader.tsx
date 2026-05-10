'use client'

import * as React from 'react'

import { Alert } from '../components/alert'
import { Button } from '../components/button'
import { Spinner } from '../components/spinner'
import { cn } from '../lib/cn'

/**
 * <OcrUploader> — strefa drag&drop / file picker dla zdjęć dokumentów (mandat,
 * wezwanie, nakaz). Wysyła plik do `/api/uploads`, czeka na parse Claude vision,
 * po sukcesie zwraca rozpoznane pola do parenta — typowo `<DynamicForm>` przez
 * prop `ocrData`.
 *
 * UX (chunk D08):
 *  - Drag-over highlight (border precision-blue + bg precision-blue-50)
 *  - Klik strefy = otwarcie file pickera
 *  - Po wyborze: thumb (jeśli image) + nazwa + size + spinner "AI czyta…"
 *  - Po sukcesie: lista rozpoznanych pól + confidence badge + "Użyj tych danych"
 *  - Niska confidence (<0.5) → warning banner zamiast success
 */

// ============================================================================
// Typy
// ============================================================================

export interface OcrParsedFields {
  numer_mandatu?: string
  numer_wezwania?: string
  numer_sprawy?: string
  data_zdarzenia?: string
  data_pisma?: string
  data_wymagalnosci?: string
  miejsce_zdarzenia?: string
  organ?: string
  wierzyciel?: string
  przewoznik?: string
  zarzadca_strefy?: string
  nazwa_strazy?: string
  kwota?: number
  waluta?: string
  numer_rejestracyjny?: string
  rodzaj_wykroczenia?: string
  artykuly_powolane?: string[]
  [key: string]: unknown
}

export interface OcrParsedDocument {
  document_type: string
  confidence: number
  raw_text: string
  fields: OcrParsedFields
  suggested_case_type?: string
  warnings: string[]
}

export interface OcrUploadResult {
  upload: { id: string; status: string }
  parsed?: OcrParsedDocument
  warning?: string
  error?: string
}

export interface OcrUploaderProps {
  /** UUID sprawy (jeśli plik dograny do istniejącej sprawy). */
  caseId?: string
  /** Hint dla AI (np. "to jest mandat za prędkość"). */
  hint?: string
  /** Akceptowane MIME types. */
  accept?: string
  /** Max size w MB (default 10). */
  maxSizeMb?: number
  /** Callback po sukcesie OCR — wywoływany gdy user kliknie "Użyj tych danych". */
  onParsed?: (parsed: OcrParsedDocument, uploadId: string) => void
  /** Callback przy błędzie. */
  onError?: (error: string) => void
  /** Tekst pomocniczy nad strefą upload. */
  helperText?: string
  className?: string
}

// ============================================================================
// Komponent
// ============================================================================

export function OcrUploader({
  caseId,
  hint,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 10,
  onParsed,
  onError,
  helperText,
  className,
}: OcrUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [result, setResult] = React.useState<OcrParsedDocument | null>(null)
  const [uploadId, setUploadId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Cleanup blob URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // ==========================================================================
  // Handlers
  // ==========================================================================

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const f = files[0]!
    const maxBytes = maxSizeMb * 1024 * 1024
    if (f.size > maxBytes) {
      const msg = `Plik za duży (${(f.size / 1024 / 1024).toFixed(1)} MB). Maksymalnie ${maxSizeMb} MB.`
      setError(msg)
      onError?.(msg)
      return
    }
    setError(null)
    setResult(null)
    setUploadId(null)
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f))
    } else {
      setPreviewUrl(null)
    }
    void uploadFile(f)
  }

  async function uploadFile(f: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', f)
      if (caseId) fd.append('caseId', caseId)
      if (hint) fd.append('hint', hint)

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: fd,
      })

      const json = (await res.json().catch(() => ({}))) as OcrUploadResult

      if (!res.ok) {
        const msg = json.error ?? `Błąd ${res.status}. Spróbuj ponownie.`
        setError(msg)
        onError?.(msg)
        return
      }

      if (json.warning && !json.parsed) {
        setError(json.warning)
        onError?.(json.warning)
        return
      }

      if (json.parsed) {
        setResult(json.parsed)
        setUploadId(json.upload.id)
      } else {
        setError('Nie udało się odczytać pliku.')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd sieci'
      setError(msg)
      onError?.(msg)
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setResult(null)
    setUploadId(null)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleApply() {
    if (result && uploadId) {
      onParsed?.(result, uploadId)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  // Stan: brak pliku → strefa drop
  if (!file && !uploading && !result) {
    return (
      <div className={cn('space-y-3', className)}>
        {helperText ? <p className="text-sm text-iron-600 dark:text-iron-400">{helperText}</p> : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-precision-blue-600/30',
            dragOver
              ? 'border-precision-blue-600 bg-precision-blue-50 dark:bg-precision-blue-950/30'
              : 'border-iron-300 bg-white hover:border-precision-blue-400 hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:hover:border-precision-blue-500',
          )}
        >
          <UploadIcon className="h-10 w-10 text-iron-400" />
          <div>
            <p className="font-medium text-iron-900 dark:text-iron-100">
              Kliknij lub przeciągnij zdjęcie dokumentu
            </p>
            <p className="mt-1 text-xs text-iron-500">
              JPEG / PNG / WebP · do {maxSizeMb} MB · AI rozpozna pola automatycznie
            </p>
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {error ? (
          <Alert variant="danger" title="Błąd">
            {error}
          </Alert>
        ) : null}
      </div>
    )
  }

  // Stan: upload w toku lub gotowy → karta z thumb + statusem
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start gap-4 rounded-xl border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Podgląd"
            className="h-24 w-24 shrink-0 rounded-lg border border-iron-200 object-cover dark:border-iron-700"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-iron-100 dark:bg-iron-800">
            <DocIcon className="h-8 w-8 text-iron-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-iron-900 dark:text-iron-100">
            {file?.name ?? 'Plik'}
          </p>
          <p className="text-xs text-iron-500">
            {file ? `${(file.size / 1024).toFixed(0)} KB` : ''}
            {uploading ? ' · AI czyta…' : ''}
          </p>
          {uploading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-precision-blue-700 dark:text-precision-blue-400">
              <Spinner className="h-4 w-4" />
              Trwa parsowanie (do 30 s)
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Usuń plik"
          className="shrink-0 rounded-md p-1.5 text-iron-500 transition-colors hover:bg-iron-100 hover:text-iron-900 dark:hover:bg-iron-800"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <Alert variant="danger" title="OCR nieudany">
          {error}
        </Alert>
      ) : null}

      {result ? <OcrResultPanel result={result} onApply={handleApply} /> : null}
    </div>
  )
}

// ============================================================================
// Sub-komponenty
// ============================================================================

function OcrResultPanel({
  result,
  onApply,
}: {
  result: OcrParsedDocument
  onApply: () => void
}) {
  const confidencePct = Math.round(result.confidence * 100)
  const confidenceColor =
    result.confidence >= 0.75
      ? 'text-volt-700 bg-volt-100 border-volt-300'
      : result.confidence >= 0.5
        ? 'text-precision-blue-700 bg-precision-blue-50 border-precision-blue-200'
        : 'text-status-amber-700 bg-status-amber-100 border-status-amber-500'

  const fieldEntries = Object.entries(result.fields).filter(
    ([_, v]) => v !== undefined && v !== null && v !== '',
  )

  return (
    <div className="space-y-3 rounded-xl border border-iron-200 bg-iron-50 p-4 dark:border-iron-800 dark:bg-iron-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckIcon className="h-5 w-5 text-volt-600" />
          <span className="font-medium text-iron-900 dark:text-iron-100">
            Rozpoznano: <span className="font-mono text-sm">{result.document_type}</span>
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider',
            confidenceColor,
          )}
        >
          {confidencePct}% pewności
        </span>
      </div>

      {result.warnings.length > 0 ? (
        <Alert variant="warning" title="Uwagi AI">
          <ul className="ml-4 list-disc space-y-1">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {fieldEntries.length > 0 ? (
        <div className="rounded-lg border border-iron-200 bg-white p-4 dark:border-iron-800 dark:bg-iron-900">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-iron-500">
            Wykryte pola
          </p>
          <dl className="space-y-1.5 text-sm">
            {fieldEntries.slice(0, 12).map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between gap-4 border-b border-iron-100 pb-1.5 last:border-0 last:pb-0 dark:border-iron-800"
              >
                <dt className="font-mono text-xs text-iron-500">{k}</dt>
                <dd className="text-right font-medium text-iron-900 dark:text-iron-100">
                  {formatFieldValue(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="text-sm italic text-iron-500">
          Nie wykryto pól nadających się do auto-uzupełnienia.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onApply}
          disabled={fieldEntries.length === 0}
        >
          Użyj tych danych →
        </Button>
      </div>
    </div>
  )
}

function formatFieldValue(v: unknown): string {
  if (v == null) return '—'
  if (Array.isArray(v)) return v.length === 0 ? '—' : v.join(', ')
  if (typeof v === 'number') return v.toLocaleString('pl-PL')
  return String(v)
}

// ============================================================================
// Ikony (inline SVG — bez lucide-react aby zminimalizować zależności)
// ============================================================================

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
