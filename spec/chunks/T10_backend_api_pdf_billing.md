# 4. Backend - API PDF render + Stripe checkout/webhook

**Chunk ID:** `T10_backend_api_pdf_billing`
**Source:** tech (lines 1501-1763)
**Tags:** api, pdf, puppeteer, stripe, billing, webhook, fakturownia
**Target Agents:** backend, payments

---

POST /api/documents/[docId]/pdf — Renderowanie PDF
// app/api/documents/[docId]/pdf/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { renderMarkdownToPdf } from '@/lib/pdf/generator'

export async function POST(
    req: Request,
    { params }: { params: { docId: string } }
) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Pobierz dokument
    const { data: doc } = await supabase
        .from('documents')
        .select('*, cases(*)')
        .eq('id', params.docId)
        .eq('user_id', session.user.id)
        .single()

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Sprawdź czy opłacone
    if (doc.cases.payment_status !== 'paid' && doc.cases.payment_status !== 'free') {
        return NextResponse.json({ error: 'Payment required' }, { status: 402 })
    }

    // Renderuj PDF
    const pdfBuffer = await renderMarkdownToPdf(doc.content_markdown, {
        title: doc.title,
        userName: session.user.user_metadata?.full_name,
        caseId: doc.case_id,
        date: new Date().toLocaleDateString('pl-PL'),
    })

    // Zapisz w Storage
    const fileName = `${doc.case_id}/${doc.id}_v${doc.version}.pdf`
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw uploadError

    // Zapisz dokument PDF w bazie
    await supabase.from('documents').insert({
        case_id: doc.case_id,
        user_id: session.user.id,
        doc_type: 'final_pdf',
        title: doc.title + ' (PDF)',
        storage_path: fileName,
        file_name: `${doc.title.replace(/\s+/g, '_')}.pdf`,
        file_size: pdfBuffer.length,
        mime_type: 'application/pdf',
        parent_document_id: doc.id,
    })

    // Signed URL do pobrania
    const { data: signedUrl } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 3600) // 1h

    return NextResponse.json({
        success: true,
        downloadUrl: signedUrl?.signedUrl,
    })
}

POST /api/billing/checkout — Tworzenie sesji płatności Stripe
// app/api/billing/checkout/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { PRICING } from '@/lib/constants/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { caseId, promoCode } = await req.json()

    // Pobierz sprawę i cennik
    const { data: caseData } = await supabase
        .from('cases')
        .select('*, case_type_config!inner(*)')
        .eq('id', caseId)
        .eq('user_id', session.user.id)
        .single()

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    let amount = caseData.case_type_config.price_pln  // w groszach
    let discountPercent = 0

    // Sprawdź kod promocyjny
    if (promoCode) {
        const { data: promo } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode.toUpperCase())
            .eq('is_active', true)
            .single()

        if (promo && (!promo.max_uses || promo.current_uses < promo.max_uses)) {
            discountPercent = promo.discount_percent
            amount = Math.round(amount * (1 - discountPercent / 100))

            // Inkrementuj użycia
            await supabase
                .from('promo_codes')
                .update({ current_uses: promo.current_uses + 1 })
                .eq('id', promo.id)
        }
    }

    // Sprawdź subskrypcję (czy użytkownik ma limit)
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, documents_this_month, documents_limit')
        .eq('id', session.user.id)
        .single()

    if (profile && profile.documents_limit > 0 && profile.documents_this_month < profile.documents_limit) {
        // Użytkownik ma aktywną subskrypcję z wolnymi dokumentami
        await supabase.from('cases').update({ payment_status: 'paid', amount_paid: 0 }).eq('id', caseId)
        await supabase.from('profiles').update({ documents_this_month: profile.documents_this_month + 1 }).eq('id', session.user.id)
        
        return NextResponse.json({ success: true, free: true })
    }

    // Utwórz sesję Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'p24', 'blik'],
        mode: 'payment',
        customer_email: session.user.email,
        line_items: [{
            price_data: {
                currency: 'pln',
                product_data: {
                    name: caseData.case_type_config.display_name,
                    description: `Mandatomat.pl — ${caseData.case_type_config.short_name}`,
                },
                unit_amount: amount,
            },
            quantity: 1,
        }],
        metadata: {
            case_id: caseId,
            user_id: session.user.id,
            case_type: caseData.case_type,
            promo_code: promoCode || '',
            discount_percent: String(discountPercent),
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sprawy/${caseId}/pobranie?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sprawy/${caseId}/platnosc`,
    })

    // Zapisz payment
    await supabase.from('payments').insert({
        user_id: session.user.id,
        case_id: caseId,
        stripe_checkout_session_id: checkoutSession.id,
        amount: amount,
        payment_type: 'one_time',
        product_name: caseData.case_type_config.display_name,
        product_code: caseData.case_type,
        promo_code: promoCode,
        discount_percent: discountPercent,
        original_amount: caseData.case_type_config.price_pln,
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
}

POST /api/billing/webhook — Stripe Webhook
// app/api/billing/webhook/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role — omija RLS
)

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const { case_id, user_id } = session.metadata!

            // Aktualizuj płatność
            await supabase
                .from('payments')
                .update({
                    status: 'succeeded',
                    stripe_payment_intent_id: session.payment_intent as string,
                })
                .eq('stripe_checkout_session_id', session.id)

            // Aktualizuj sprawę
            await supabase
                .from('cases')
                .update({
                    payment_status: 'paid',
                    amount_paid: session.amount_total,
                    stripe_payment_intent_id: session.payment_intent as string,
                    status: 'paid',
                })
                .eq('id', case_id)

            // Event
            await supabase.from('events').insert({
                user_id,
                case_id,
                event_type: 'payment_succeeded',
                data: { amount: session.amount_total, stripe_session: session.id },
            })

            // Generuj fakturę (Fakturownia)
            // TODO: wywołanie Fakturownia API

            break
        }

        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('stripe_checkout_session_id', session.id)
            break
        }

        // Obsługa subskrypcji
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            // TODO: obsługa zmian subskrypcji
            break
    }

    return NextResponse.json({ received: true })
}

GET /api/deadlines/check — CRON (co godzinę)