'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * <CodeEditor> — lekki edytor kodu z numeracją linii i walidacją JSON.
 *
 * Zastępuje Monaco w `/admin/szablony` i `/admin/prompty` — bez zewnętrznego
 * bundle (Monaco = ~2MB) i bez problemów z CSP `script-src 'self'`.
 *
 * Funkcje:
 *  - Synchronizowana kolumna z numerami linii (przewijana razem z textarea)
 *  - Tabulator wstawia 2 spacje (zamiast focus jump)
 *  - Walidacja JSON live (gdy `language="json"`) — komunikat błędu pod editorem
 *  - Auto-resize wysokości na podstawie zawartości (z minimum/maximum)
 *  - Renderowanie po stronie klienta (textarea natywne, focus accessible)
 *
 * Zgodne z CSP — żadnych eval, żadnych skryptów z CDN.
 */

export interface CodeEditorProps {
  name: string
  defaultValue: string
  language?: 'json' | 'markdown' | 'text'
  rows?: number
  required?: boolean
  /** Hidden mirror — dla form action (Server Actions) */
  formId?: string
  /** Accessible label */
  ariaLabel?: string
  /** Disable JSON live validation */
  validateJson?: boolean
  className?: string
}

export function CodeEditor({
  name,
  defaultValue,
  language = 'text',
  rows = 20,
  required,
  formId,
  ariaLabel,
  validateJson = true,
  className,
}: CodeEditorProps) {
  const id = useId()
  const taRef = useRef<HTMLTextAreaElement>(null)
  const lineColRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const lineCount = value.split('\n').length

  // Sync scroll between textarea and line numbers
  useEffect(() => {
    const ta = taRef.current
    const col = lineColRef.current
    if (!ta || !col) return
    const onScroll = () => {
      col.scrollTop = ta.scrollTop
    }
    ta.addEventListener('scroll', onScroll, { passive: true })
    return () => ta.removeEventListener('scroll', onScroll)
  }, [])

  // Walidacja JSON live
  useEffect(() => {
    if (language !== 'json' || !validateJson) {
      setJsonError(null)
      return
    }
    if (!value.trim()) {
      setJsonError(null)
      return
    }
    try {
      JSON.parse(value)
      setJsonError(null)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Niepoprawny JSON')
    }
  }, [value, language, validateJson])

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Tab => 2 spacje (zamiast focus jump)
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      setValue(newValue)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
    // Ctrl/Cmd+S => zapis (przekaż do submita formularza)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      const form = formId ? document.getElementById(formId) : e.currentTarget.form
      if (form && form instanceof HTMLFormElement) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div className={`code-editor ${className ?? ''}`}>
      <div className="relative flex overflow-hidden rounded-md border border-iron-200 bg-iron-50 dark:border-iron-700 dark:bg-iron-950">
        {/* Numeracja linii */}
        <div
          ref={lineColRef}
          aria-hidden="true"
          className="select-none overflow-hidden border-r border-iron-200 bg-iron-100 px-2 py-2 text-right font-mono text-xs leading-relaxed text-iron-400 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-500"
          style={{
            minWidth: '2.75rem',
            // Wysokość zsynchronizowana z textarea
            maxHeight: `${rows * 1.5}rem`,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="tabular-nums">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Edytor */}
        <textarea
          ref={taRef}
          id={id}
          name={name}
          rows={rows}
          required={required}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          aria-label={ariaLabel ?? name}
          aria-invalid={jsonError ? true : undefined}
          aria-describedby={jsonError ? `${id}-error` : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="focus:ring-brand-500 block w-full resize-y bg-transparent px-3 py-2 font-mono text-xs leading-relaxed text-iron-900 outline-none focus:ring-1 dark:text-iron-100"
          data-language={language}
        />
      </div>

      {/* Stopka: licznik znaków / linii / błąd JSON */}
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-iron-500 dark:text-iron-400">
          {lineCount} {lineCount === 1 ? 'linia' : 'linii'} · {value.length} znaków
          {language === 'json' && !jsonError && value.trim() && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ JSON OK</span>
          )}
        </span>
        {jsonError && (
          <span
            id={`${id}-error`}
            role="alert"
            className="ml-2 truncate text-signal-600 dark:text-signal-400"
            title={jsonError}
          >
            ✗ {jsonError}
          </span>
        )}
      </div>
    </div>
  )
}
