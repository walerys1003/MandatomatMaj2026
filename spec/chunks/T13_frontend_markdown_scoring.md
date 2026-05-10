# 5. Frontend - Markdown editor + Scoring gauge

**Chunk ID:** `T13_frontend_markdown_scoring`
**Source:** tech (lines 2207-2351)
**Tags:** frontend, markdown, editor, scoring, gauge, framer_motion
**Target Agents:** frontend

---

5.3 Podgląd i edytor Markdown (components/documents/)
// components/documents/markdown-editor.tsx
'use client'
import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface MarkdownEditorProps {
    content: string
    onChange: (content: string) => void
    validation?: { isValid: boolean; issues: string[]; suggestions: string[] }
}

export function MarkdownEditor({ content, onChange, validation }: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview')

    const renderHtml = useCallback(() => {
        const raw = marked(content) as string
        return DOMPurify.sanitize(raw)
    }, [content])

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Validation banner */}
            {validation && !validation.isValid && (
                <div className="bg-amber-50 border-b border-amber-200 p-3">
                    <p className="text-sm font-medium text-amber-800">
                        Wykryto {validation.issues.length} uwag:
                    </p>
                    <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                        {validation.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <div className="border-b bg-muted/30 px-4">
                    <TabsList className="bg-transparent">
                        <TabsTrigger value="preview">Podgląd</TabsTrigger>
                        <TabsTrigger value="edit">Edycja</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="preview" className="p-8">
                    <div
                        className="prose prose-sm max-w-none font-serif"
                        dangerouslySetInnerHTML={{ __html: renderHtml() }}
                    />
                </TabsContent>

                <TabsContent value="edit" className="p-4">
                    <Textarea
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        className="min-h-[600px] font-mono text-sm"
                        placeholder="Edytuj treść pisma..."
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

5.4 Scoring — komponent z gauge (components/scoring/)
// components/scoring/scoring-gauge.tsx
'use client'
import { motion } from 'framer-motion'

interface ScoringGaugeProps {
    score: number  // 0-100
    reasoning: string
}

export function ScoringGauge({ score, reasoning }: ScoringGaugeProps) {
    const getColor = (s: number) => {
        if (s >= 70) return { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Wysokie szanse' }
        if (s >= 40) return { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Umiarkowane szanse' }
        return { bg: 'bg-red-500', text: 'text-red-700', label: 'Niskie szanse' }
    }

    const colors = getColor(score)
    const circumference = 2 * Math.PI * 60
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-6 p-8">
            {/* Circular gauge */}
            <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <motion.circle
                        cx="70" cy="70" r="60" fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className={colors.text}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-4xl font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}%
                    </motion.span>
                    <span className={`text-xs font-medium ${colors.text}`}>
                        {colors.label}
                    </span>
                </div>
            </div>

            {/* Reasoning */}
            <p className="text-center text-muted-foreground max-w-md">
                {reasoning}
            </p>

            {/* CTA */}
            {score >= 30 && (
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium">
                        Masz podstawy do odwołania!
                    </p>
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                        Wygeneruj odwołanie — od 79 zł
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Prawnik za to samo: 300-1 500 zł
                    </p>
                </div>
            )}
        </div>
    )
}
