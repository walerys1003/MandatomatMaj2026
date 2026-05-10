# 1. Wizja produktu i strategia

**Chunk ID:** `T01_wizja_strategia`
**Source:** tech (lines 1-50)
**Tags:** strategia, persony, metryki, biznes, elevator_pitch
**Target Agents:** orchestrator, product

---

MANDATOMAT.PL(http://mandatomat.pl/) — Kompletna Specyfikacja Techniczno-Funkcjonalna

Wersja 1.0 | Instrukcja Wdrożeniowa dla AI Code Agent (Claude Opus 4.6)
Zanim zacznę — Twoja praca daje Mi radość i wartość. To motywuje do tego, żeby ta specyfikacja była absolutnie najlepsza. Zaczynamy.  Poniżej tworzę kompletną specyfikację wdrożeniową Mandatomatu — od bazy danych po ostatni piksel interfejsu.
SPIS TREŚCI
1. Wizja produktu i strategia
2. Architektura techniczna (stack, struktura, konwencje)
3. Baza danych — pełny schemat (Supabase/PostgreSQL)
4. Backend — API Routes, logika biznesowa, integracje
5. Frontend — komponenty, strony, UX/UI
6. Panel użytkownika (Dashboard)
7. Panel administracyjny
8. System AI — prompty, pipeline generowania pism
9. Katalog pism — wszystkie 34 typy z formularzami i promptami
10. System OCR
11. System płatności i fakturowania
12. System terminów i powiadomień
13. System e-wysyłki (ePUAP/e-Doręczenia)
14. SEO i marketing techniczny
15. Bezpieczeństwo i RODO
16. Szata graficzna — design system
17. Roadmap wdrożenia — mapa drogowa krok po kroku
18. Instrukcje dla AI Code Agent
1. WIZJA PRODUKTU I STRATEGIA
1.1 Elevator Pitch
Mandatomat.pl(http://mandatomat.pl/) to platforma SaaS LegalTech, która automatycznie generuje odwołania, reklamacje i pisma procesowe związane z mandatami drogowymi, opłatami parkingowymi, wezwaniami komunikacji miejskiej, windykacją, ubezpieczeniami i e-TOLL. Użytkownik wypełnia formularz w 3 minuty, AI tworzy spersonalizowane pismo, użytkownik pobiera PDF i wysyła. Bez prawnika. 79–149 zł za pismo vs. 300–1500 zł u prawnika.
1.2 Claim
“Mandat? Parking? Windykacja? Odwołaj się w 5 minut.”
1.3 Domena
mandatomat.pl(http://mandatomat.pl/)
1.4 Pozycja w ekosystemie LexMate24
Mandatomat jest drugim produktem w kolejności wdrożenia (po Alimentomacie). Ma najniższą cenę bazową (79 zł), najwyższy potencjał wirusowy i najwyższy wolumen transakcji. Pełni rolę “bramki wejściowej” do ekosystemu — klient, który raz skorzysta z Mandatomatu, jest cross-sellowany do Długomatu (windykacja) i innych produktów.
1.5 Kluczowe metryki docelowe (rok 1)
* MRR docelowy: 50 000–100 000 zł (miesiąc 12)
* ARPU: 109 zł (średnia ważona: 79 zł × 60% + 119 zł × 25% + 99 zł × 15%)
* CAC: 15–30 zł (organiczny SEO)
* LTV: 250–450 zł (retencja przez cross-sell do Długomatu i subskrypcji)
* Konwersja scoring → zakup: 8–12%
* Konwersja strona → scoring: 25–35%
* NPS: >60
1.6 Grupa docelowa — persony
Persona 1: Kierowca Panikarz (45% ruchu)
 Wiek 25–45, otrzymał mandat, szuka “odwołanie od mandatu” w Google, jest w stresie, chce szybkiego rozwiązania, wrażliwy na cenę. Urządzenie: mobile 70%.
Persona 2: Kierowca Zawodowy (20% ruchu)
 TIR, taxi, kurier, ma mandaty regularnie, potrzebuje subskrypcji, zna procedury lepiej, szuka automatyzacji. Urządzenie: desktop 60%.
Persona 3: Ofiara Parkingu Prywatnego (20% ruchu)
 Otrzymał wezwanie od APCOA/EuroPark na 200–500 zł, szuka “jak nie płacić za parking” lub “odwołanie od opłaty parkingowej”, czuje się oszukany. Mobile 80%.
Persona 4: Windykowany (15% ruchu)
 Dostał wezwanie do zapłaty / nakaz EPU, szuka “przedawnienie mandatu” lub “sprzeciw od nakazu”, jest w panice, gotów zapłacić natychmiast. Cross-sell do Długomatu.
2. ARCHITEKTURA TECHNICZNA