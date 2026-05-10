# 12-13. Bezpieczeństwo, RODO + Design System (rezerwowy)

**Chunk ID:** `T19_security_rodo_design`
**Source:** tech (lines 2862-2982)
**Tags:** security, rodo, design_system, kolory, typografia
**Target Agents:** security, design

---

12. BEZPIECZEŃSTWO I RODO
12.1 Warstwa bezpieczeństwa
* Szyfrowanie danych wrażliwych (PESEL): AES-256 na poziomie aplikacji przed zapisem do bazy
* JWT z krótkim TTL (15 min access token, 7 dni refresh)
* RLS na każdej tabeli (omijane tylko przez service_role key)
* CSRF protection (Next.js wbudowane)
* Rate limiting na API routes (middleware, 100 req/min/IP)
* Walidacja Zod na każdym endpoincie
* Sanityzacja HTML (DOMPurify na Markdown renderingu)
* Content Security Policy headers
* HTTPS only (Vercel default)
* Signed URLs z TTL na dokumenty w Storage
12.2 RODO
* Polityka prywatności i regulamin (strony statyczne)
* Consent management: checkbox przy rejestracji + osobna zgoda na marketing
* Prawo do usunięcia danych: endpoint DELETE /api/profile/delete (cascade delete all user data)
* Prawo do eksportu: endpoint GET /api/profile/export (JSON dump all user data)
* Retencja danych: automatyczne usuwanie nieaktywnych kont po 24 miesiącach (CRON)
* DPA (Data Processing Agreement) z Supabase, Anthropic, Stripe
* Minimalizacja danych: PESEL opcjonalne, zbieranie tylko tego co niezbędne per formularz
* Transparentność AI: informacja “To pismo zostało wygenerowane przez AI i wymaga Twojej weryfikacji”
13. SZATA GRAFICZNA — DESIGN SYSTEM
13.1 Paleta kolorów
/* Kolory brandowe Mandatomat */
:root {
    /* Primary: granat/navy — zaufanie, profesjonalizm, prawo */
    --primary: 222 47% 20%;           /* #1B2A4A — deep navy */
    --primary-foreground: 0 0% 100%;
    
    /* Secondary: złoto/amber — sprawiedliwość, wartość */
    --secondary: 38 92% 50%;          /* #F5A623 — amber gold */
    --secondary-foreground: 222 47% 20%;
    
    /* Accent: emerald — sukces, nadzieja */
    --accent: 160 84% 39%;            /* #10B981 */
    --accent-foreground: 0 0% 100%;
    
    /* Danger: red — pilność, terminy */
    --destructive: 0 84% 60%;         /* #EF4444 */
    
    /* Background */
    --background: 220 14% 96%;        /* #F1F3F9 — lekki szarobłękitny */
    --card: 0 0% 100%;                /* biały */
    --muted: 220 13% 91%;
    --muted-foreground: 220 9% 46%;
    
    /* Kolory kategorii */
    --cat-mandaty: 0 84% 60%;         /* red */
    --cat-parking: 217 91% 60%;       /* blue */
    --cat-windykacja: 38 92% 50%;     /* amber */
    --cat-ubezpieczenia: 160 84% 39%; /* green */
    --cat-etoll: 271 81% 56%;         /* purple */
    --cat-kontrole: 25 95% 53%;       /* orange */
    --cat-techniczne: 220 9% 46%;     /* gray */
}

13.2 Typografia
/* Font stack */
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Dla pism prawnych (PDF) */
.legal-document {
    font-family: 'Times New Roman', 'Georgia', serif;
}

/* Hierarchy */
h1: text-4xl (36px) font-bold tracking-tight
h2: text-2xl (24px) font-semibold
h3: text-xl (20px) font-semibold
h4: text-lg (18px) font-medium
body: text-base (16px) font-normal leading-relaxed
small: text-sm (14px)
caption: text-xs (12px) text-muted-foreground

13.3 Komponenty kluczowe — wytyczne wizualne
Karty kategorii (landing page):
* Zaokrąglone rogi (rounded-xl), cień (shadow-md), hover: shadow-lg + translate-y-[-2px]
* Kolorowy pasek u góry (4px, kolor kategorii)
* Ikona Lucide w kole z tłem (bg-[cat-color]/10)
* Tytuł + krótki opis + “X typów pism” badge + cena
Status badges:
* draft: bg-gray-100 text-gray-700
* generating: bg-blue-100 text-blue-700 + spinner animowany
* preview: bg-amber-100 text-amber-700
* paid: bg-emerald-100 text-emerald-700
* sent: bg-purple-100 text-purple-700
* waiting: bg-orange-100 text-orange-700
* resolved: bg-green-100 text-green-700 ✓
* archived: bg-gray-50 text-gray-400
Scoring gauge:
* 0-30%: red gradient
* 31-60%: amber gradient
* 61-100%: emerald gradient
* Animacja: licznik od 0 do wartości (1.5s ease-out)
* Ring SVG z animowanym strokeDasharray
Stepper (wizard formularza):
* Poziomy na desktop, pionowy na mobile
* Kroki: numer w kole (active: primary, completed: emerald ✓, inactive: gray)
* Linie łączące z gradient animation
* Active step: pulsujący ring
CTA buttons:
* Główny: bg-primary text-white, hover:bg-primary/90, rounded-lg, px-8 py-3
* Duży CTA: text-lg, shadow-lg, hover:shadow-xl, scale hover 102%
* Gradient CTA (landing): bg-gradient-to-r from-primary to-primary/80
Dark mode: NIE w MVP. Jasny motyw only — prawne pisma wymagają czytelności.
13.4 Responsywność
* Mobile-first design (Tailwind default)
* Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
* Sidebar: collapsed → bottom nav na mobile
* Formularze: 1 kolumna na mobile, 2 kolumny na desktop
* Tabele (admin): horizontal scroll na mobile
* PDF podgląd: full-width na mobile z pinch-to-zoom
13.5 Animacje i mikro-interakcje
* Framer Motion dla: scoringu (gauge), stepów formularza, pojawienia się wyników, loading states
* Transition all na hover efektach (150ms ease)
* Skeleton loading (shadcn Skeleton) na asynchroniczne ładowanie
* Confetti animation po udanym wygenerowaniu pisma (opcjonalnie, subtelny) — canvas-confetti
* Smooth scroll na landing page (sekcje)
14. ROADMAP WDROŻENIA — MAPA DROGOWA