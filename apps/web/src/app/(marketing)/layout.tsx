import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'

/**
 * Marketing layout — landing + static pages (regulamin, polityka, kontakt, etc.).
 * Sticky Navbar + Footer iron-950.
 *
 * T5-FE-036: skip-link a11y dla nawigacji klawiaturą (WCAG 2.4.1 Bypass Blocks).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-precision-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-precision-blue-500 focus:ring-offset-2"
      >
        Przejdź do treści głównej
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
