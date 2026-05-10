import { NextResponse, type NextRequest } from 'next/server'

import { generatePdf, formatPolishDate } from '@/lib/pdf/generator'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/get-ip'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/documents/[docId]/pdf
 *
 * Renderuje dokument do PDF i zapisuje w Storage bucket 'documents'.
 * Zwraca signed URL ważny 1h.
 *
 * Pipeline:
 *  1. Auth + rate limit
 *  2. Załaduj documents row (RLS sprawdza ownership)
 *  3. Sprawdź case.status — jeśli !paid → watermark "PROJEKT"
 *  4. Cache: jeśli storage_path istnieje + payment_status='paid', tylko zwróć signed URL
 *  5. Render markdown → PDF (pdf-lib, A4, Times Roman 12pt)
 *  6. Upload do Storage `documents/<userId>/<docId>_v<version>.pdf`
 *  7. UPDATE documents.storage_path + file_size + mime_type
 *  8. Zwróć signed URL (createSignedUrl 3600s)
 *
 * GET /api/documents/[docId]/pdf — alias dla POST (idempotent).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface DocRow {
  id: string
  case_id: string
  user_id: string
  doc_type: string
  title: string
  content_markdown: string | null
  storage_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  version: number
  is_current: boolean
}

interface CaseRow {
  id: string
  user_id: string
  status: string
  case_type: string
  form_data: Record<string, unknown> | null
}

interface ProfileRow {
  full_name: string | null
  street_address: string | null
  city: string | null
  postal_code: string | null
  email: string | null
  phone: string | null
}

async function handle(req: NextRequest, docId: string): Promise<NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 })
  }

  const ip = getClientIp(req)
  const rl = await rateLimit(`pdf:${user.id}:${ip}`, 'default')
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  // Załaduj dokument (RLS = ownership check)
  const { data: docData, error: docErr } = await supabase
    .from('documents')
    .select('id, case_id, user_id, doc_type, title, content_markdown, storage_path, file_name, file_size, mime_type, version, is_current')
    .eq('id', docId)
    .maybeSingle()

  if (docErr || !docData) {
    return NextResponse.json({ error: 'Dokument nie istnieje.' }, { status: 404 })
  }
  const doc = docData as DocRow

  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Brak dostępu.' }, { status: 403 })
  }

  if (!doc.content_markdown) {
    return NextResponse.json(
      { error: 'Dokument nie ma jeszcze treści — wygeneruj pismo najpierw.' },
      { status: 400 },
    )
  }

  // Załaduj sprawę (do payment status + form_data)
  const { data: caseData } = await supabase
    .from('cases')
    .select('id, user_id, status, case_type, form_data')
    .eq('id', doc.case_id)
    .maybeSingle()

  const caseRow = caseData as CaseRow | null
  const isPaid = caseRow?.status === 'paid' || caseRow?.status === 'archived'
  const draft = !isPaid

  // Załaduj profil dla header
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, street_address, city, postal_code, email, phone')
    .eq('id', user.id)
    .maybeSingle()
  const profile = profileData as ProfileRow | null

  // T4-BE-017: Cache — jeśli paid i storage_path istnieje, tylko signed URL
  const admin = createAdminClient()

  if (isPaid && doc.storage_path) {
    const { data: signed, error: signErr } = await admin.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 3600)

    if (!signErr && signed?.signedUrl) {
      return NextResponse.json(
        {
          url: signed.signedUrl,
          cached: true,
          expiresAt: Date.now() + 3600_000,
          fileSize: doc.file_size,
          version: doc.version,
        },
        { headers: rateLimitHeaders(rl) },
      )
    }
    // Cache miss — re-render
  }

  // Build header z form_data + profile
  const senderLines: string[] = []
  const formData = (caseRow?.form_data ?? {}) as Record<string, unknown>
  const fdName = (formData['full_name'] ?? formData['imie_nazwisko'] ?? profile?.full_name) as string | undefined
  const fdStreet = (formData['street_address'] ?? formData['ulica'] ?? profile?.street_address) as string | undefined
  const fdCity = (formData['city'] ?? formData['miasto'] ?? profile?.city) as string | undefined
  const fdPost = (formData['postal_code'] ?? formData['kod_pocztowy'] ?? profile?.postal_code) as string | undefined
  const fdEmail = (formData['email'] ?? profile?.email) as string | undefined
  const fdPhone = (formData['phone'] ?? formData['telefon'] ?? profile?.phone) as string | undefined

  if (fdName) senderLines.push(fdName)
  if (fdStreet) senderLines.push(fdStreet)
  if (fdPost && fdCity) senderLines.push(`${fdPost} ${fdCity}`)
  else if (fdCity) senderLines.push(fdCity)
  if (fdEmail) senderLines.push(fdEmail)
  if (fdPhone) senderLines.push(`tel. ${fdPhone}`)

  const placeName = fdCity ?? 'Warszawa'
  const placeAndDate = `${placeName}, dnia ${formatPolishDate(new Date())}`

  // Render PDF
  let pdfBytes: Uint8Array
  let pageCount: number
  try {
    const result = await generatePdf({
      title: doc.title,
      contentMarkdown: doc.content_markdown,
      header: { senderLines, placeAndDate },
      draft,
      version: doc.version,
    })
    pdfBytes = result.bytes
    pageCount = result.pageCount
  } catch (err) {
    console.error('[pdf] render failed:', err)
    return NextResponse.json(
      { error: 'Nie udało się wygenerować PDF.' },
      { status: 500 },
    )
  }

  // Upload do Storage
  const safeTitle = (doc.title || 'pismo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const storagePath = `${user.id}/${doc.case_id}/${doc.id}_v${doc.version}_${safeTitle}.pdf`
  const fileName = `${safeTitle}_v${doc.version}.pdf`

  const { error: uploadErr } = await admin.storage
    .from('documents')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
      cacheControl: '3600',
    })

  if (uploadErr) {
    console.error('[pdf] upload failed:', uploadErr)
    return NextResponse.json({ error: 'Nie udało się zapisać PDF.' }, { status: 500 })
  }

  // UPDATE documents — tylko jeśli nie draft (cache tylko dla paid)
  if (!draft) {
    await admin
      .from('documents')
      .update({
        storage_path: storagePath,
        file_name: fileName,
        file_size: pdfBytes.byteLength,
        mime_type: 'application/pdf',
      })
      .eq('id', doc.id)
  }

  // Telemetry event
  await admin.from('events').insert({
    user_id: user.id,
    case_id: doc.case_id,
    event_type: 'document_downloaded',
    data: {
      document_id: doc.id,
      version: doc.version,
      page_count: pageCount,
      file_size: pdfBytes.byteLength,
      draft,
    },
  })

  // Signed URL
  const { data: signed, error: signErr } = await admin.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600)

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Nie udało się wygenerować linku.' }, { status: 500 })
  }

  return NextResponse.json(
    {
      url: signed.signedUrl,
      cached: false,
      draft,
      expiresAt: Date.now() + 3600_000,
      fileSize: pdfBytes.byteLength,
      pageCount,
      version: doc.version,
    },
    { headers: rateLimitHeaders(rl) },
  )
}

export async function POST(
  req: NextRequest,
  context: { params: { docId: string } },
): Promise<NextResponse> {
  return handle(req, context.params.docId)
}

export async function GET(
  req: NextRequest,
  context: { params: { docId: string } },
): Promise<NextResponse> {
  return handle(req, context.params.docId)
}
