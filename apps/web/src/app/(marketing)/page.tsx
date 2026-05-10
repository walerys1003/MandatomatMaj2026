import { CategoryGrid } from '@/components/marketing/category-grid'
import { CtaFooter } from '@/components/marketing/cta-footer'
import { FaqAccordion, FAQ_ITEMS } from '@/components/marketing/faq-accordion'
import { Hero } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingSection } from '@/components/marketing/pricing-section'
import { SocialProof } from '@/components/marketing/social-proof'
import { SuccessRateTracker } from '@/components/marketing/success-rate-tracker'

/**
 * Landing page — kompozycja sekcji marketingowych.
 *
 * Kolejność (zgodnie z planem T2-DES-021..033):
 *  1. Hero — H1 + 2 CTA + stats line + siatka perspektywiczna
 *  2. SocialProof — pisali o nas + 3 testimoniale
 *  3. HowItWorks — 3 kroki
 *  4. CategoryGrid — 9 kategorii (cross-sell windykacji highlighted)
 *  5. SuccessRateTracker — wskaźniki skuteczności per kategoria
 *  6. PricingSection — 3 plany na iron-950 + B2B teaser
 *  7. FaqAccordion — 8 pytań (też w JSON-LD FAQPage)
 *  8. CtaFooter — silne CTA przed properly footer
 *
 * JSON-LD (FAQPage) wstawiony inline na końcu — Google liked structured data.
 */

export default function LandingPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <CategoryGrid />
      <SuccessRateTracker />
      <PricingSection />
      <FaqAccordion />
      <CtaFooter />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  )
}
