# 4. Backend - CRON deadlines + OCR pipeline + PDF generator

**Chunk ID:** `T11_backend_api_deadlines_ocr_pdf`
**Source:** tech (lines 1764-2018)
**Tags:** cron, deadlines, reminders, ocr, tesseract, puppeteer, pdf
**Target Agents:** backend, notifications, ocr

---

// app/api/deadlines/check/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDeadlineReminder } from '@/lib/notifications/email'
import { sendSmsReminder } from '@/lib/notifications/sms'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    // Zabezpieczenie CRON
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Pobierz aktywne deadlines
    const { data: deadlines } = await supabase
        .from('deadlines')
        .select('*, profiles!inner(*), cases!inner(*)')
        .eq('status', 'active')
        .gte('deadline_date', today)

    if (!deadlines) return NextResponse.json({ processed: 0 })

    let sent = 0

    for (const deadline of deadlines) {
        const deadlineDate = new Date(deadline.deadline_date)
        const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

        // Sprawdź czy ten dzień jest w remind_days i czy jeszcze nie wysłano
        if (!deadline.remind_days.includes(daysUntil)) continue

        // Sprawdź czy już wysłano na ten dzień
        const { data: existing } = await supabase
            .from('reminders_log')
            .select('id')
            .eq('deadline_id', deadline.id)
            .eq('days_before', daysUntil)
            .limit(1)

        if (existing && existing.length > 0) continue

        // Wyślij e-mail
        if (deadline.profiles.notification_email) {
            await sendDeadlineReminder({
                to: deadline.profiles.email,
                userName: deadline.profiles.full_name || 'Użytkowniku',
                deadlineTitle: deadline.title,
                deadlineDate: deadline.deadline_date,
                daysLeft: daysUntil,
                caseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sprawy/${deadline.case_id}`,
            })

            await supabase.from('reminders_log').insert({
                deadline_id: deadline.id,
                user_id: deadline.user_id,
                channel: 'email',
                days_before: daysUntil,
            })
            sent++
        }

        // Wyślij SMS (tylko dla płatnych planów)
        if (deadline.profiles.notification_sms && deadline.profiles.subscription_plan !== 'free') {
            await sendSmsReminder({
                phone: deadline.profiles.phone,
                message: `Mandatomat: ${deadline.title} — zostało ${daysUntil} dni (do ${deadline.deadline_date}). Sprawdź: mandatomat.pl/sprawy/${deadline.case_id}`,
            })

            await supabase.from('reminders_log').insert({
                deadline_id: deadline.id,
                user_id: deadline.user_id,
                channel: 'sms',
                days_before: daysUntil,
            })
            sent++
        }

        // Aktualizuj status deadline'u
        if (daysUntil === 0) {
            // Sprawdź za 24h czy expired
        }
    }

    return NextResponse.json({ processed: deadlines.length, sent })
}

4.4 OCR Pipeline (lib/ocr/)
// lib/ocr/tesseract.ts
import Tesseract from 'tesseract.js'

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const worker = await Tesseract.createWorker('pol') // Polski OCR
    const { data: { text, confidence } } = await worker.recognize(imageBuffer)
    await worker.terminate()
    return text
}

// lib/ocr/parser.ts
import { generateDocument } from '@/lib/ai/claude'

export async function parseOcrText(rawText: string): Promise<{
    sygnatura?: string
    data_dokumentu?: string
    data_zdarzenia?: string
    kwota?: number
    organ?: string
    typ_pisma?: string
    strony?: { powod?: string; pozwany?: string }
    termin_odpowiedzi?: string
    numer_mandatu?: string
    punkty_karne?: number
    [key: string]: any
}> {
    const result = await generateDocument({
        systemPrompt: `Jesteś parserem dokumentów prawnych. Wyciągnij strukturalne dane z tekstu OCR.
Odpowiedz WYŁĄCZNIE w formacie JSON z następującymi polami (jeśli dostępne):
- sygnatura (string)
- data_dokumentu (string, format YYYY-MM-DD)
- data_zdarzenia (string)
- kwota (number, w PLN)
- organ (string, np. "Komendant Miejski Policji w Warszawie")
- typ_pisma (string, np. "mandat karny", "wezwanie do zapłaty", "nakaz zapłaty EPU")
- strony (object: {powod, pozwany})
- termin_odpowiedzi (string)
- numer_mandatu (string)
- punkty_karne (number)
Jeśli pole nie jest dostępne w tekście, pomiń je. NIE wymyślaj danych.`,
        userData: { raw_ocr_text: rawText },
        model: 'claude-haiku-4-5',
        maxTokens: 800,
    })

    return JSON.parse(result.content)
}

4.5 PDF Generator (lib/pdf/generator.ts)
// lib/pdf/generator.ts
import puppeteer from 'puppeteer'
import { marked } from 'marked'

interface PdfOptions {
    title: string
    userName?: string
    caseId?: string
    date: string
}

export async function renderMarkdownToPdf(
    markdown: string,
    options: PdfOptions
): Promise<Buffer> {
    const htmlContent = await marked(markdown)

    const fullHtml = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 2.5cm 2cm 2cm 3cm;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
        }
        h1 {
            font-size: 14pt;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24pt;
        }
        h2 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 18pt;
            margin-bottom: 6pt;
        }
        p {
            text-align: justify;
            margin-bottom: 6pt;
            text-indent: 1.25cm;
        }
        p:first-of-type {
            text-indent: 0;
        }
        .header-right {
            text-align: right;
            margin-bottom: 24pt;
        }
        .signature-line {
            margin-top: 48pt;
            text-align: right;
            border-top: 1px solid #333;
            width: 200px;
            float: right;
            padding-top: 4pt;
            font-size: 10pt;
        }
        ul, ol {
            margin-left: 1cm;
        }
        li {
            margin-bottom: 3pt;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 8pt;
            color: #999;
            text-align: center;
            border-top: 0.5pt solid #ddd;
            padding-top: 4pt;
        }
    </style>
</head>
<body>
    ${htmlContent}
    <div class="signature-line">
        (podpis)
    </div>
    <div class="footer">
        Wygenerowano przez Mandatomat.pl — ${options.date}
    </div>
</body>
</html>`

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '2.5cm', right: '2cm', bottom: '2cm', left: '3cm' },
    })
    await browser.close()

    return Buffer.from(pdfBuffer)
}