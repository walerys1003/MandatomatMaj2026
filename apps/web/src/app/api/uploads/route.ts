import { NextResponse, type NextRequest } from 'next/server'

import {
  AnthropicError,
  parseOcrDocument,
  type OcrParsedDocument,
} from '@/lib/ai'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/uploads
 *
 * Multipart/form-data:
 *  - file:    Blob (PDF/JPEG/PNG/WebP/HEIC), max 10 MB
 *  - caseId:  UUID (optional — można dograć do istniejącej sprawy)
 *  - hint:    string (optional — np. "to jest mandat za prędkość")
 *
 * Pipeline:
 *  1. Auth + rate limit (bucket 'ai': 30/min/user)
 *  2. Validate MIME + size
 *  3. Upload do Supabase Storage bucket 'uploads' (path: <userId>/<random>-<filename>)
 *  4. INSERT do uploads (status='processing')
 *  5. Parse Claude vision (Sonnet) — TYLKO dla obrazków (PDF na razie nie OCR-ujemy)
 *  6. UPDATE uploads (status='completed' + ocr_parsed_data)
 *  7. Return parsed fields → klient auto-fill formularza
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_ALL_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
])

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  // Rate limit (OCR jest dragie — 1 call ≈ $0.02)
  const rl = await rateLimit(`user:${user.id}`, 'ai')
  const headers = rateLimitHeaders(rl)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zbyt wiele żądań OCR. Spróbuj ponownie za chwilę.', retryAfter: rl.reset },
      { status: 429, headers },
    )
  }

  // Parse multipart
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Nieprawidłowy format danych (oczekiwane multipart/form-data)' },
      { status: 400, headers },
    )
  }

  const file = formData.get('file')
  const caseIdRaw = formData.get('caseId')
  const hintRaw = formData.get('hint')

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Brak pola "file"' }, { status: 400, headers })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Plik jest pusty' }, { status: 400, headers })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Plik za duży. Maksymalny rozmiar: ${MAX_FILE_SIZE / 1024 / 1024} MB` },
      { status: 413, headers },
    )
  }

  const mimeType = file.type || 'application/octet-stream'
  if (!ALLOWED_ALL_MIMES.has(mimeType)) {
    return NextResponse.json(
      {
        error: 'Nieobsługiwany typ pliku. Akceptujemy: JPEG, PNG, WebP, PDF.',
        receivedMime: mimeType,
      },
      { status: 415, headers },
    )
  }

  const filename =
    file instanceof File && file.name ? sanitizeFilename(file.name) : 'upload.bin'
  const caseId =
    typeof caseIdRaw === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      caseIdRaw,
    )
      ? caseIdRaw
      : null
  const hint = typeof hintRaw === 'string' && hintRaw.length > 0 && hintRaw.length < 200 ? hintRaw : undefined

  // Jeśli podano caseId — zweryfikuj, że to sprawa usera (RLS to też zrobi, ale wcześniej da 404)
  if (caseId) {
    const { data: caseRow } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()
    if (!caseRow) {
      return NextResponse.json(
        { error: 'Sprawa nie znaleziona lub brak uprawnień' },
        { status: 404, headers },
      )
    }
  }

  // Upload do storage: <userId>/<timestamp>-<random>-<filename>
  const random = Math.random().toString(36).slice(2, 10)
  const storagePath = `${user.id}/${Date.now()}-${random}-${filename}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadErr } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadErr) {
    console.error('[uploads] Storage upload failed:', uploadErr)
    return NextResponse.json(
      { error: `Nie udało się zapisać pliku: ${uploadErr.message}` },
      { status: 500, headers },
    )
  }

  // INSERT uploads — status='processing'
  const insertPayload = {
    user_id: user.id,
    case_id: caseId,
    storage_path: storagePath,
    original_filename: filename,
    file_size: file.size,
    mime_type: mimeType,
    ocr_status: 'processing' as const,
  }

  const { data: uploadRow, error: insertErr } = await supabase
    .from('uploads')
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertErr || !uploadRow) {
    console.error('[uploads] DB insert failed:', insertErr)
    // Cleanup orphan file
    await supabase.storage.from('uploads').remove([storagePath]).catch(() => {})
    return NextResponse.json(
      { error: `Nie udało się zarejestrować pliku: ${insertErr?.message ?? 'unknown'}` },
      { status: 500, headers },
    )
  }

  const uploadId = (uploadRow as { id: string }).id

  // PDF — na razie pomijamy OCR (Claude vision PDF wymaga osobnego flow z dokument-blocks).
  // Plik jest zapisany, OCR włączymy w kolejnej iteracji.
  if (mimeType === 'application/pdf') {
    await supabase
      .from('uploads')
      .update({
        ocr_status: 'failed',
        ocr_error: 'OCR dla PDF wkrótce — na razie obsługujemy tylko zdjęcia (JPEG/PNG/WebP).',
      })
      .eq('id', uploadId)

    return NextResponse.json(
      {
        upload: { id: uploadId, status: 'failed' },
        warning:
          'PDF zapisaliśmy, ale OCR dla PDF jest dostępny tylko dla zdjęć. Zrób screenshot strony i wyślij ponownie.',
      },
      { status: 200, headers },
    )
  }

  // OCR przez Claude vision — tylko obrazki
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
    await supabase
      .from('uploads')
      .update({
        ocr_status: 'failed',
        ocr_error: `Format ${mimeType} nieobsługiwany przez OCR. Konwertuj do JPEG/PNG.`,
      })
      .eq('id', uploadId)

    return NextResponse.json(
      {
        upload: { id: uploadId, status: 'failed' },
        warning: 'Plik zapisany, ale tego formatu nie potrafimy zaparsować.',
      },
      { status: 200, headers },
    )
  }

  // Konwersja → base64
  const base64 = bufferToBase64(buffer)
  const visionMime = mimeType as 'image/jpeg' | 'image/png' | 'image/webp'

  let ocrResult: OcrParsedDocument | null = null
  let ocrCostUsd = 0
  let ocrTokensIn = 0
  let ocrTokensOut = 0
  try {
    const result = await parseOcrDocument({
      imageBase64: base64,
      mediaType: visionMime,
      userHint: hint,
    })
    ocrResult = result.data
    ocrCostUsd = result.costUsd
    ocrTokensIn = result.raw.usage.input_tokens
    ocrTokensOut = result.raw.usage.output_tokens
  } catch (e) {
    const errorMsg =
      e instanceof AnthropicError
        ? `OCR nieudany: ${e.message}`
        : e instanceof Error
          ? e.message
          : 'Nieznany błąd OCR'

    console.error('[uploads] OCR failed:', errorMsg)

    await supabase
      .from('uploads')
      .update({
        ocr_status: 'failed',
        ocr_error: errorMsg.slice(0, 500),
      })
      .eq('id', uploadId)

    return NextResponse.json(
      {
        upload: { id: uploadId, status: 'failed' },
        error: 'AI nie sparsował dokumentu. Sprawdź jakość zdjęcia i spróbuj ponownie.',
        detail: errorMsg,
      },
      { status: 502, headers },
    )
  }

  // UPDATE uploads — status='completed' + dane
  await supabase
    .from('uploads')
    .update({
      ocr_status: 'completed',
      ocr_raw_text: ocrResult.raw_text.slice(0, 5000),
      ocr_parsed_data: ocrResult,
      ocr_confidence: Math.round(ocrResult.confidence * 100) / 100,
      detected_fields: ocrResult.fields,
    })
    .eq('id', uploadId)

  // Telemetria
  void supabase.from('events').insert({
    user_id: user.id,
    event_name: 'ocr_completed',
    metadata: {
      upload_id: uploadId,
      case_id: caseId,
      document_type: ocrResult.document_type,
      confidence: ocrResult.confidence,
      suggested_case_type: ocrResult.suggested_case_type,
      mime_type: mimeType,
      file_size: file.size,
      cost_usd: ocrCostUsd,
      tokens_input: ocrTokensIn,
      tokens_output: ocrTokensOut,
    },
  })

  return NextResponse.json(
    {
      upload: {
        id: uploadId,
        status: 'completed',
        storage_path: storagePath,
        original_filename: filename,
      },
      parsed: ocrResult,
    },
    { status: 200, headers },
  )
}

// ============================================================================
// Helpers
// ============================================================================

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100)
}

function bufferToBase64(buf: Uint8Array): string {
  // Edge & Node — używamy Buffer jeśli dostępny, fallback na manualnym
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64')
  }
  let binary = ''
  for (let i = 0; i < buf.byteLength; i++) {
    binary += String.fromCharCode(buf[i]!)
  }
  return btoa(binary)
}
