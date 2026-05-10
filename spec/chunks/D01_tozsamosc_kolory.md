# 4.1-4.2 Tożsamość marki + System kolorów (Precision Blue, Iron, Volt)

**Chunk ID:** `D01_tozsamosc_kolory`
**Source:** design (lines 1-95)
**Tags:** design, kolory, brand, precision_blue, iron, volt_green, tozsamosc
**Target Agents:** design, frontend

---

4. MANDATOMAT
Instrukcja dla agenta AI: Frontend & Design System
4.1 TOŻSAMOŚĆ MARKI
Mandatomat obsługuje najszerszą grupę użytkowników ze wszystkich SaaS-ów LexMate24. Kierowcy (mandaty drogowe, fotoradary), pasażerowie komunikacji miejskiej (opłaty ZTM/MPK), właściciele samochodów (parkowanie, e-TOLL), przedsiębiorcy transportowi (ITD), posiadacze polis (OC/AC). Emocje przy wejściu: irytacja, poczucie niesprawiedliwości, chęć szybkiego rozwiązania. Kontekst jest LŻEJSZY niż w Długomacie (nikt nie traci domu z powodu mandatu) i MNIEJ INTYMNY niż w Rozwodomacie (mandat to nie rozwód). Mandatomat to najbardziej „produktowy", najbardziej „SaaS-owy" ze wszystkich czterech — szybki, efektywny, skalowalny.
Archetyp marki: Inżynier. Precyzyjny, metodyczny, pewny swoich narzędzi. Nie dramatyzuje. Nie współczuje. Rozwiązuje problem — szybko, skutecznie, bezemocjonalnie.
Jedno zdanie definiujące design: „Interfejs Bloomberg Terminal — ale dla mandatów. Czysty, gęsty, profesjonalny."
Kluczowa różnica wobec innych SaaS-ów LexMate24: Mandatomat jest NAJSZYBSZY — najkrótsze wizardy (3–4 kroki), najkrótsze animacje (150ms), najgęstszy UI (więcej informacji na ekranie), najostrzejsze krawędzie. Zero sentymentu. Czysta efektywność.
4.2 SYSTEM KOLORÓW
Agent AI: proporcje — 72% neutrals (dominacja grafitu i bieli), 18% primary (electric blue precyzyjnie dozowany), 7% przestrzeń, 3% akcent. Mandatomat to jedyny SaaS LexMate24, w którym primary color NIE jest ciemny — electric blue na białym tle jest czysty, techniczny, industrialny.
Primary — Precision Blue
Nie navy (to Długomat). Nie teal (to Rozwodomat). Nie indigo (to Alimentomat). Electric blue — kolor interfejsów lotniczych, kokpitów, systemów nawigacji. Mówi: precyzja, technologia, system. To kolor, który nie pyta o emocje — wykonuje zadanie.
:root {
  /* Tekst w ciemnych sekcjach, overlay */
  --blue-950: #172554;
  --blue-900: #1E3A5F;
  
  /* Sidebar, dark sections */
  --blue-800: #1E40AF;
  --blue-700: #1D4ED8;
  
  /* PRIMARY — buttony, linki, focus ring, aktywne elementy */
  --blue-600: #2563EB;
  
  /* Hover */
  --blue-500: #3B82F6;
  
  /* Ikony, bordery aktywne, dekoracje */
  --blue-400: #60A5FA;
  
  /* Badge tła, subtletne highlights */
  --blue-300: #93C5FD;
  --blue-200: #BFDBFE;
  --blue-100: #DBEAFE;
  --blue-50:  #EFF6FF;
}

Neutral — Iron
Czysta, zimna szarość z minimalnym niebieskim podtonem. Nie ciepła (Alimentomat), nie kamienna (Rozwodomat), nie stalowa (Długomat). Żelazna — twarda, industrialna, precyzyjna. Najciemniejszy odcień (#09090B) jest prawie czarny — ale nie jest czarny. To zinc.
:root {
  --iron-950: #09090B;
  --iron-900: #18181B;
  --iron-800: #27272A;
  --iron-700: #3F3F46;
  --iron-600: #52525B;
  --iron-500: #71717A;
  --iron-400: #A1A1AA;
  --iron-300: #D4D4D8;
  --iron-200: #E4E4E7;
  --iron-100: #F4F4F5;
  --iron-50:  #FAFAFA;
}

Accent — Volt Green
Zieleń sygnałowa — jeszcze bardziej nasycona niż emerald Długomatu. To kolor statusu „sukces" na ekranie systemu: odwołanie przyjęte, sprawa wygrana, mandat anulowany. Używana oszczędnie — wyłącznie na success states, badge „Uwzględnione", ikona wyniku pozytywnego.
:root {
  --volt-700: #15803D;
  --volt-600: #16A34A;
  --volt-500: #22C55E;
  --volt-400: #4ADE80;
  --volt-300: #86EFAC;
  --volt-100: #DCFCE7;
  --volt-50:  #F0FDF4;
}

Accent 2 — Signal Red
Odmowa odwołania, negatywny wynik, termin przekroczony. WYŁĄCZNIE semantic — nigdy dekoracyjny.
:root {
  --signal-700: #B91C1C;
  --signal-600: #DC2626;
  --signal-500: #EF4444;
  --signal-400: #F87171;
  --signal-100: #FEE2E2;
  --signal-50:  #FEF2F2;
}

Accent 3 — Amber Status
Termin w toku, oczekuje na odpowiedź, w trakcie rozpatrywania.
:root {
  --status-amber-600: #D97706;
  --status-amber-500: #F59E0B;
  --status-amber-100: #FEF3C7;
}

Semantic
:root {
  --success: #16A34A;
  --success-light: #DCFCE7;
  --warning: #D97706;
  --warning-light: #FEF3C7;
  --danger: #DC2626;
  --danger-light: #FEE2E2;
  --info: #2563EB;
  --info-light: #DBEAFE;
}
