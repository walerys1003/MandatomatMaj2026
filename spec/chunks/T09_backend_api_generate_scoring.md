# 4. Backend - API generate-document + scoring

**Chunk ID:** `T09_backend_api_generate_scoring`
**Source:** tech (lines 1335-1500)
**Tags:** api, generate, scoring, ai, claude
**Target Agents:** backend, ai

---

POST /api/ai/generate-document — Generowanie pisma
// app/api/ai/generate-document/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateDocument, validateDocument } from '@/lib/ai/claude'
import { loadPrompt } from '@/lib/ai/prompts'
import { z } from 'zod'

const RequestSchema = z.object({
    caseId: z.string().uuid(),
})

export async function POST(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { caseId } = RequestSchema.parse(body)

        // Pobierz sprawę
        const { data: caseData, error: caseError } = await supabase
            .from('cases')
            .select('*, uploads(*)')
            .eq('id', caseId)
            .eq('user_id', session.user.id)
            .single()

        if (caseError || !caseData) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // Pobierz konfigurację typu sprawy
        const { data: config } = await supabase
            .from('case_type_config')
            .select('*')
            .eq('case_type', caseData.case_type)
            .single()

        if (!config) {
            return NextResponse.json({ error: 'Case type config not found' }, { status: 500 })
        }

        // Załaduj prompt z pliku .md
        const systemPrompt = await loadPrompt(config.prompt_file)

        // Zbierz dane OCR (jeśli są)
        const ocrData = caseData.uploads?.[0]?.ocr_parsed_data || undefined

        // Oznacz status
        await supabase
            .from('cases')
            .update({ status: 'generating' })
            .eq('id', caseId)

        // Generuj pismo
        const result = await generateDocument({
            systemPrompt,
            userData: caseData.form_data,
            ocrData,
            model: config.ai_model as any,
        })

        // Walidacja formalna (drugi, tani prompt)
        const validation = await validateDocument(result.content, caseData.case_type)

        // Zapisz dokument
        const { data: doc } = await supabase
            .from('documents')
            .insert({
                case_id: caseId,
                user_id: session.user.id,
                doc_type: 'draft_markdown',
                title: config.display_name,
                content_markdown: result.content,
                ai_model_used: result.model,
                ai_tokens_input: result.tokensInput,
                ai_tokens_output: result.tokensOutput,
                ai_cost_usd: result.costUsd,
            })
            .select()
            .single()

        // Generuj checklistę załączników
        // (osobny, krótki prompt)
        const checklistPrompt = `Na podstawie typu pisma "${config.display_name}" i danych formularza, wygeneruj checklistę załączników do dołączenia. Format: lista Markdown (- [ ] pozycja). Tylko najważniejsze, realne załączniki.`
        
        const checklistResult = await generateDocument({
            systemPrompt: checklistPrompt,
            userData: caseData.form_data,
            model: 'claude-haiku-4-5',
            maxTokens: 500,
        })

        await supabase.from('documents').insert({
            case_id: caseId,
            user_id: session.user.id,
            doc_type: 'checklist',
            title: 'Checklista załączników',
            content_markdown: checklistResult.content,
        })

        // Aktualizuj status sprawy
        await supabase
            .from('cases')
            .update({ status: 'preview' })
            .eq('id', caseId)

        // Zapisz event
        await supabase.from('events').insert({
            user_id: session.user.id,
            case_id: caseId,
            event_type: 'case_generation_completed',
            data: {
                model: result.model,
                tokens: result.tokensInput + result.tokensOutput,
                cost_usd: result.costUsd,
                validation: validation,
            },
        })

        return NextResponse.json({
            success: true,
            document: doc,
            validation,
            checklist: checklistResult.content,
        })
    } catch (error: any) {
        console.error('Generate document error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

POST /api/ai/scoring — Scoring szans (darmowy)
// app/api/ai/scoring/route.ts
import { NextResponse } from 'next/server'
import { scoringAnalysis } from '@/lib/ai/claude'
import { z } from 'zod'

const RequestSchema = z.object({
    caseType: z.string(),
    description: z.string().min(10).max(2000),
    hasEvidence: z.boolean().optional(),
    eventDate: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { caseType, description, hasEvidence, eventDate } = RequestSchema.parse(body)

        const enrichedDescription = `${description}${hasEvidence ? ' (posiada dowody)' : ''}${eventDate ? ` Data zdarzenia: ${eventDate}` : ''}`

        const result = await scoringAnalysis(enrichedDescription, caseType)

        return NextResponse.json({
            score: result.score,
            reasoning: result.reasoning,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
