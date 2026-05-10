'use client'

import { useEffect, useState } from 'react'

import { Button } from '@mandatomat/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@mandatomat/ui/card'

interface Props {
  code: string
  discountPercent: number
}

/**
 * ReferralShareCard — UI do udostępniania kodu referral.
 *
 * - Pokazuje kod (font-mono, duży) + przycisk "Skopiuj kod"
 * - Pokazuje pełny URL `https://mandatomat.pl/rejestracja?ref=MND-XXXXXXXX` + "Skopiuj link"
 * - Przyciski "Udostępnij" (Web Share API) jeśli dostępne
 * - Fallback: mailto:, sms: jeśli Web Share niedostępne
 */
export function ReferralShareCard({ code, discountPercent }: Props): JSX.Element {
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [hasWebShare, setHasWebShare] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShareUrl(`${window.location.origin}/rejestracja?ref=${encodeURIComponent(code)}`)
    setHasWebShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [code])

  const shareText = `Cześć! Polecam Ci Mandatomat — pomoże Ci napisać odwołanie od mandatu, parking ticket lub windykacji w 5 minut. Załóż konto przez mój link i zgarnij ${discountPercent}% zniżki na pierwsze pismo:`

  const copy = async (text: string, kind: 'code' | 'url'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      if (kind === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    } catch {
      // ignore
    }
  }

  const handleShare = async (): Promise<void> => {
    if (!hasWebShare) return
    try {
      await navigator.share({
        title: 'Mandatomat — odwołanie od mandatu w 5 minut',
        text: shareText,
        url: shareUrl,
      })
    } catch {
      // user canceled lub błąd — ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twój kod polecający</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border-2 border-dashed border-precision-blue-300 bg-precision-blue-50 p-5 text-center dark:border-precision-blue-800 dark:bg-precision-blue-950/40">
          <p className="font-mono text-[11px] uppercase tracking-wider text-precision-blue-700 dark:text-precision-blue-300">
            Twój kod
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-wider text-iron-950 dark:text-white sm:text-4xl">
            {code}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => void copy(code, 'code')}
            type="button"
            aria-label="Skopiuj kod referral do schowka"
          >
            {copiedCode ? '✓ Skopiowano!' : '📋 Skopiuj kod'}
          </Button>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="referral-share-url"
            className="font-mono text-[11px] uppercase tracking-wider text-iron-600 dark:text-iron-300"
          >
            Link do udostępniania
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="referral-share-url"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 truncate rounded-md border border-iron-300 bg-iron-50 px-3 py-2 font-mono text-sm text-iron-700 focus:outline-none focus:ring-2 focus:ring-precision-blue-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => void copy(shareUrl, 'url')}
              type="button"
              disabled={!shareUrl}
            >
              {copiedUrl ? '✓ Skopiowano!' : 'Skopiuj link'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasWebShare ? (
            <Button
              variant="secondary-soft"
              size="md"
              onClick={() => void handleShare()}
              type="button"
            >
              📤 Udostępnij
            </Button>
          ) : null}
          <a
            href={`mailto:?subject=${encodeURIComponent('Mandatomat — polecam, dostaniesz 20% zniżki')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
            className="inline-flex items-center gap-2 rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-700 transition hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200 dark:hover:bg-iron-800"
          >
            ✉️ E-mail
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            className="inline-flex items-center gap-2 rounded-md border border-iron-300 bg-white px-4 py-2 text-sm font-medium text-iron-700 transition hover:bg-iron-50 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-200 dark:hover:bg-iron-800"
          >
            💬 SMS
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
