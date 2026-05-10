import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'

import '@mandatomat/ui/globals.css'

const displayFont = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

const bodyFont = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mandatomat.pl'),
  title: {
    default: 'Mandatomat — odwołania od mandatów w 5 minut',
    template: '%s · Mandatomat',
  },
  description:
    'Mandatomat generuje odwołania od mandatów drogowych, parkingowych, e-TOLL, ZTM/MPK i więcej. Sztuczna inteligencja + 200+ podstaw prawnych. Bez prawnika, w 5 minut.',
  applicationName: 'Mandatomat',
  authors: [{ name: 'Mandatomat.pl' }],
  keywords: [
    'mandat',
    'odwołanie od mandatu',
    'mandat drogowy',
    'mandat parkingowy',
    'fotoradar',
    'e-TOLL',
    'windykacja',
    'ubezpieczenia',
  ],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://mandatomat.pl',
    siteName: 'Mandatomat',
    title: 'Mandatomat — odwołania od mandatów w 5 minut',
    description:
      'Generuj profesjonalne odwołania od mandatów. Bez prawnika. W 5 minut. 200+ podstaw prawnych.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mandatomat — odwołania od mandatów w 5 minut',
    description: 'Generuj odwołania od mandatów w 5 minut. AI + prawo. Mandatomat.pl',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-white text-iron-900 antialiased dark:bg-iron-950 dark:text-iron-50">
        {children}
      </body>
    </html>
  )
}
