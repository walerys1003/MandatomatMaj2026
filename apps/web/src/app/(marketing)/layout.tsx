import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'

/**
 * Marketing layout — landing + static pages (regulamin, polityka, kontakt, etc.).
 * Sticky Navbar + Footer iron-950.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
