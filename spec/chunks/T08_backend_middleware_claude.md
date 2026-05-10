# 4. Backend - Middleware + Claude API wrapper

**Chunk ID:** `T08_backend_middleware_claude`
**Source:** tech (lines 1177-1334)
**Tags:** middleware, auth, claude, ai, anthropic
**Target Agents:** backend, ai

---

4. BACKEND — API ROUTES I LOGIKA BIZNESOWA
4.1 Middleware (middleware.ts)
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Ścieżki chronione — wymagają logowania
    const protectedPaths = ['/dashboard', '/sprawy', '/dokumenty', '/terminy', '/profil', '/ustawienia']
    const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    // Admin — wymagają roli admin
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    if (isProtected && !session) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isAdmin && session) {
        // Sprawdź rolę (w production: dodatkowa weryfikacja server-side)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
        
        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    // Auth pages — jeśli zalogowany, redirect do dashboard
    const authPaths = ['/login', '/rejestracja']
    if (authPaths.some(path => req.nextUrl.pathname.startsWith(path)) && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons|api/billing/webhook).*)']
}

4.2 Claude API Wrapper (lib/ai/claude.ts)
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateDocumentParams {
    systemPrompt: string
    userData: Record<string, any>
    ocrData?: Record<string, any>
    model?: 'claude-sonnet-4-6' | 'claude-haiku-4-5' | 'claude-opus-4-6'
    maxTokens?: number
}

export interface GenerateDocumentResult {
    content: string           // Markdown
    tokensInput: number
    tokensOutput: number
    model: string
    costUsd: number
}

// Cennik per mln tokenów (aktualizować per zmiana cennika Anthropic)
const PRICING: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
    'claude-haiku-4-5': { input: 0.25, output: 1.25 },
    'claude-opus-4-6': { input: 15.00, output: 75.00 },
}

export async function generateDocument(params: GenerateDocumentParams): Promise<GenerateDocumentResult> {
    const model = params.model || 'claude-sonnet-4-6'
    const maxTokens = params.maxTokens || 4096

    const userMessage = `
DANE SPRAWY:
${JSON.stringify(params.userData, null, 2)}

${params.ocrData ? `DANE Z OCR:\n${JSON.stringify(params.ocrData, null, 2)}` : ''}

Wygeneruj kompletne pismo na podstawie powyższych danych i instrukcji systemowej.
`

    const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        system: params.systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    const content = textContent?.text || ''

    const tokensInput = response.usage.input_tokens
    const tokensOutput = response.usage.output_tokens
    const pricing = PRICING[model]
    const costUsd = (tokensInput * pricing.input + tokensOutput * pricing.output) / 1_000_000

    return {
        content,
        tokensInput,
        tokensOutput,
        model,
        costUsd,
    }
}

export async function scoringAnalysis(description: string, caseType: string): Promise<{
    score: number
    reasoning: string
    tokensUsed: number
}> {
    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system: `Jesteś ekspertem od prawa wykroczeń i administracyjnego w Polsce. Na podstawie opisu sytuacji oceń szanse na skuteczne odwołanie/reklamację w skali 0-100%. Odpowiedz TYLKO w formacie JSON: {"score": X, "reasoning": "2-3 zdania uzasadnienia po polsku"}`,
        messages: [{ role: 'user', content: `Typ sprawy: ${caseType}\nOpis: ${description}` }],
    })

    const text = response.content.find(c => c.type === 'text')?.text || ''
    const parsed = JSON.parse(text)

    return {
        score: parsed.score,
        reasoning: parsed.reasoning,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    }
}

export async function validateDocument(markdown: string, caseType: string): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
}> {
    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        system: `Jesteś audytorem prawnym. Sprawdź pismo procesowe pod kątem kompletności formalnej. Czy zawiera wszystkie wymagane elementy (nagłówek, strony, żądanie, uzasadnienie, podpis, załączniki)? Odpowiedz JSON: {"isValid": true/false, "issues": ["..."], "suggestions": ["..."]}`,
        messages: [{ role: 'user', content: `Typ pisma: ${caseType}\n\nTreść:\n${markdown}` }],
    })

    const text = response.content.find(c => c.type === 'text')?.text || ''
    return JSON.parse(text)
}

4.3 Główne API Routes