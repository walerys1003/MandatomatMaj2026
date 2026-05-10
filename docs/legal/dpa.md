# Umowa Powierzenia Przetwarzania Danych Osobowych (DPA)

**Data Processing Agreement — Mandatomat**

Wersja: 1.0
Data wejścia w życie: 2026-01-01
Status: szablon do podpisania B2B / klient enterprise

---

## 1. Strony

**Administrator danych** (dalej: "Administrator"):
Klient korzystający z usługi Mandatomat na podstawie Regulaminu i niniejszej DPA.

**Podmiot przetwarzający** (dalej: "Procesor"):
Mandatomat sp. z o.o. (w organizacji), z siedzibą w Polsce, NIP/KRS — w trakcie rejestracji.
Adres do korespondencji: kontakt@mandatomat.pl

---

## 2. Przedmiot i czas powierzenia

Procesor przetwarza dane osobowe wyłącznie w celu świadczenia usługi generowania
pism prawnych (mandat, fotoradar, parking, windykacja, EPU) oraz operacji
towarzyszących (faktury, płatności, powiadomienia e-mail/SMS).

Czas trwania: na czas obowiązywania umowy głównej + 30 dni okresu retencji
po zakończeniu, po czym dane są usuwane lub zwracane Administratorowi.

---

## 3. Charakter i cel przetwarzania

- Generowanie szkiców pism prawnych z wykorzystaniem modeli AI (Anthropic Claude).
- Eksport dokumentów do PDF i przechowywanie w Supabase Storage.
- Wysyłka transakcyjnych powiadomień e-mail (Resend) i SMS (Twilio — opcjonalnie).
- Obsługa płatności (Stripe — niezależny administrator zgodnie z polityką Stripe).

---

## 4. Rodzaj danych osobowych

- Dane identyfikacyjne: imię, nazwisko, PESEL (jeśli wymagane przez pismo).
- Dane kontaktowe: e-mail, telefon (opcjonalnie), adres do korespondencji.
- Dane sprawy: numer mandatu, data zdarzenia, treść opisu sytuacji,
  wprowadzone przez Administratora dane osób trzecich (np. odbiorca pisma).
- Dane płatnicze: tokenizowane przez Stripe — Procesor nie przechowuje numerów kart.

## 5. Kategorie osób, których dane dotyczą

- Klienci (osoby fizyczne / przedsiębiorcy) zakładający konto.
- Osoby trzecie wskazane w pismach (np. straż miejska, wierzyciel).

---

## 6. Obowiązki Procesora

Procesor zobowiązuje się do:

1. Przetwarzania danych wyłącznie na udokumentowane polecenie Administratora
   (zaakceptowany Regulamin = polecenie).
2. Stosowania środków technicznych i organizacyjnych zapewniających bezpieczeństwo
   przetwarzania (art. 32 RODO) — patrz sekcja 9.
3. Zapewnienia, że osoby upoważnione do przetwarzania zobowiązały się do zachowania
   poufności lub podlegają obowiązkowi tajemnicy zawodowej.
4. Pomocy Administratorowi w wywiązywaniu się z obowiązków wynikających z art. 32–36
   RODO (zgłoszenia naruszeń, DPIA).
5. Udostępniania Administratorowi informacji niezbędnych do wykazania zgodności
   (audyt — z 30-dniowym wyprzedzeniem, w godzinach pracy).

---

## 7. Podpowierzenie (Subprocesorzy)

Administrator wyraża zgodę na korzystanie z następujących podprocesorów:

| Podprocesor   | Cel                                  | Lokalizacja serwerów       |
| ------------- | ------------------------------------ | -------------------------- |
| Supabase Inc. | Baza danych + Storage                | EU (Frankfurt)             |
| Anthropic PBC | Model AI (Claude)                    | USA — SCCs + DPA Anthropic |
| Stripe Inc.   | Płatności (niezależny administrator) | UE / USA — SCCs            |
| Resend        | E-mail transakcyjny                  | UE                         |
| Cloudflare    | CDN + DDoS                           | Globalnie                  |
| Vercel Inc.   | Hosting (jeśli używany)              | UE — Frankfurt             |

Procesor informuje Administratora o zmianie podprocesorów z 14-dniowym wyprzedzeniem.
Administrator może wnieść uzasadniony sprzeciw — wówczas strony renegocjują warunki.

---

## 8. Transfery poza EOG

Transfery do USA (Anthropic, Stripe — pro-rata) odbywają się na podstawie:

- Standardowych Klauzul Umownych (SCCs) — Decyzja KE 2021/914,
- DPF (Data Privacy Framework) — jeśli podprocesor jest certyfikowany.

---

## 9. Środki bezpieczeństwa (art. 32 RODO)

- Szyfrowanie danych w tranzycie (TLS 1.2+) i w spoczynku (AES-256 — Supabase).
- Kontrola dostępu RBAC (role: user, admin) + RLS na poziomie bazy.
- Logowanie zdarzeń bezpieczeństwa (audit log w `events` table).
- Backup automatyczny Supabase (PITR 7 dni).
- CSP, HSTS, COOP, X-Frame-Options — patrz `apps/web/next.config.mjs`.
- Maskowanie PESEL w logach (`apps/web/src/lib/security/pesel.ts`).
- Regularne przeglądy uprawnień (kwartalne).
- Procedura zgłaszania naruszeń: kontakt@mandatomat.pl + 24h SLA.

---

## 10. Prawa osób, których dane dotyczą

Procesor wspiera Administratora w realizacji żądań na podstawie art. 15–22 RODO
(dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw).
Eksport danych: panel klienta `/profil` → "Pobierz moje dane" (JSON).
Usunięcie konta: `/profil` → "Usuń konto" (soft-delete + 30 dni grace period).

---

## 11. Zgłaszanie naruszeń

Procesor zawiadamia Administratora o stwierdzonym naruszeniu ochrony danych
osobowych bez zbędnej zwłoki, nie później niż w ciągu **24 godzin** od stwierdzenia.
Zawiadomienie zawiera informacje wymagane art. 33 ust. 3 RODO.

Kanał: kontakt@mandatomat.pl + telefon kontaktowy (uzgodniony indywidualnie).

---

## 12. Zakończenie przetwarzania

Po zakończeniu świadczenia usług Procesor — według wyboru Administratora — zwraca
lub usuwa wszystkie dane osobowe oraz wszelkie ich kopie, o ile prawo Unii lub
prawo państwa członkowskiego nie nakazuje ich dalszego przechowywania.

Termin: 30 dni od zakończenia umowy.

---

## 13. Postanowienia końcowe

- Prawo właściwe: prawo polskie + RODO (UE 2016/679).
- Sąd właściwy: właściwy dla siedziby Procesora.
- Zmiany DPA wymagają formy pisemnej (e-mail z podpisem elektronicznym dopuszczalny).

---

**Podpisy stron** (do uzupełnienia w wersji wykonanej):

Administrator: **********\_\_\_********** Data: ****\_\_\_****

Procesor: **********\_\_\_********** Data: ****\_\_\_****
