# 10-11. E-wysyłka + SEO i marketing techniczny

**Chunk ID:** `T18_seo_marketing`
**Source:** tech (lines 2804-2861)
**Tags:** seo, marketing, blog, structured_data, metadata, epuap
**Target Agents:** seo, frontend

---

10. SYSTEM E-WYSYŁKI (V2)
W MVP: Pobranie PDF + instrukcja “jak wysłać samodzielnie” (adres, termin, sposób złożenia).
W V2 (Q3):
* Integracja z ePUAP/Profil Zaufany (API gov.pl(http://gov.pl/))
* Integracja z e-Doręczeniami (ADE)
* Wysyłka emailem z potwierdzeniem doręczenia (Resend + webhook)
* Status tracking: wysłane → doręczone → (odpowiedź)
11. SEO I MARKETING TECHNICZNY
11.1 Strategia SEO (wbudowana w Next.js)
Każdy case_type ma dedykowaną stronę SEO pod long-tail:
/odwolanie-od-mandatu-za-predkosc        → M1 landing + scoring + CTA
/odmowa-przyjecia-mandatu                 → M2
/uchylenie-prawomocnego-mandatu           → M3
/odwolanie-od-mandatu-strazy-miejskiej    → M4
/odwolanie-od-mandatu-itd                 → M5
/rozlozenie-mandatu-na-raty              → M6
/uchylenie-punktow-karnych               → M7
/sprzeciw-wezwanie-parking-prywatny      → P1
/reklamacja-oplata-zdm                   → P2
/odwolanie-oplata-ztm-mpk               → P3
/odpowiedz-na-wezwanie-windykacja       → W1
/przedawnienie-mandatu                   → W2
/sprzeciw-nakaz-zaplaty-epu             → W3
/usuniecie-danych-bik-krd               → W4
/odwolanie-decyzja-ubezpieczyciela      → U1
/odwolanie-kara-etoll                   → E1
/zatrzymanie-prawa-jazdy-odwolanie      → K1

Każda strona: nagłówek SEO + opis problemu (2000+ słów) + FAQ (5-8 pytań) + interaktywny scoring (darmowy) + CTA do zakupu.
11.2 Metadata (app/layout.tsx + per page)
// app/(marketing)/odwolanie-od-mandatu-za-predkosc/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Odwołanie od mandatu za prędkość — darmowy wzór + generator AI | Mandatomat.pl',
    description: 'Odwołaj się od mandatu za przekroczenie prędkości w 5 minut. AI generuje spersonalizowane pismo. 76% skuteczność. Od 79 zł vs. 300-800 zł u prawnika. Sprawdź swoje szanse za darmo!',
    keywords: ['odwołanie od mandatu', 'mandat za prędkość', 'sprzeciw od mandatu', 'jak odwołać mandat', 'wzór odwołania od mandatu'],
    openGraph: {
        title: 'Odwołanie od mandatu za prędkość — Mandatomat.pl',
        description: 'Odwołaj się od mandatu w 5 minut z pomocą AI. 76% skuteczność.',
        url: 'https://mandatomat.pl/odwolanie-od-mandatu-za-predkosc',
        images: ['/og/mandat-predkosc.png'],
    },
}

11.3 Structured Data (JSON-LD)
Każda strona SEO zawiera:
* FAQPage schema (pytania z FAQ)
* Product schema (cena, dostępność)
* Organization schema (dane firmy)
* BreadcrumbList schema
11.4 Blog (/blog)
Content engine: artykuły 2000+ słów na frazy SEO:
* “Jak odwołać się od mandatu z fotoradaru — kompletny poradnik 2025”
* “Przedawnienie mandatu — kiedy nie musisz płacić”
* “Parking prywatny wezwanie do zapłaty — czy muszę płacić?”
* “Nakaz zapłaty z e-Sądu — co robić krok po kroku”
* etc.