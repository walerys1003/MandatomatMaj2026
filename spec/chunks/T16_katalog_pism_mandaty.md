# 9. Katalog pism - Mandaty (M1-M7) + Parking (P1-P4)

**Chunk ID:** `T16_katalog_pism_mandaty`
**Source:** tech (lines 2614-2683)
**Tags:** katalog, mandaty, parking, formularze, case_types
**Target Agents:** ai, frontend, backend

---

9. KATALOG PISM — WSZYSTKIE 34 TYPY
Poniżej pełna lista z unikalnymi polami formularza i specyfiką promptu per typ.
Kategoria 1: MANDATY KARNE (7 typów)
M1. Sprzeciw od mandatu za prędkość (mandat_sprzeciw_predkosc)
* Cena: 79 zł
* Deadline: 7 dni od wystawienia
* Formularz (krok 1 — dane mandatu): numer mandatu, data wystawienia, miejsce zdarzenia, organ (Policja/fotoradar CANARD), kwota mandatu, punkty karne
* Formularz (krok 2 — okoliczności, checklist): wadliwe urządzenie pomiarowe/brak legalizacji, nieprawidłowe oznakowanie drogi/ograniczeń, błąd identyfikacji pojazdu (nie byłem kierowcą), błędy proceduralne funkcjonariusza, okoliczności łagodzące (pierwszekolizyjne, sytuacja rodzinna), inne (pole tekstowe)
* Formularz (krok 3 — dane osobowe): imię i nazwisko, PESEL, adres zamieszkania, ton pisma (ugodowy/stanowczy)
* Formularz (opcjonalnie): upload zdjęcia mandatu/fotoradaru → OCR
* Adresat: Komendant Policji / Główny Inspektorat Transportu Drogowego (auto-dobór)
* Podstawy prawne: art. 101 § 1 KPW, art. 99 KPW, art. 33 Prawa o miarach, Rozporządzenie MIiR o przyrządach pomiarowych
M2. Odmowa przyjęcia mandatu (mandat_odmowa_przyjecia)
* Cena: 79 zł
* Deadline: na miejscu (dokument do przygotowania PRZED interwencją lub zaraz po)
* Formularz: jak M1, ale z sekcją “co powiedział funkcjonariusz” i “czy spisano protokół”
* Generowane pismo: protokół odmowy przyjęcia mandatu + instrukcja zachowania na miejscu
* Uwaga: To pismo jest generowane “na wszelki wypadek” — użytkownik może go pobrać i mieć gotowe
M3. Uchylenie prawomocnego mandatu (mandat_uchylenie_prawomocny)
* Cena: 99 zł
* Deadline: brak ustawowego (ale zalecane jak najszybciej)
* Formularz: sygnatura mandatu, data uprawomocnienia, podstawy uchylenia (nowe dowody, oczywiste naruszenie prawa, wadliwość prawomocności)
* Adresat: Sąd Rejonowy właściwy wg miejsca popełnienia wykroczenia
* Podstawy prawne: art. 101 § 1, art. 100 § 1 i 2 KPW
M4. Odwołanie od mandatu Straży Miejskiej (mandat_odwolanie_straz)
* Cena: 79 zł
* Deadline: 7 dni
* Formularz: jak M1, ale organ = Straż Miejska, opcje specyficzne: brak kompetencji SM do kontroli prędkości, strefa ruchu, oznakowanie strefy płatnego parkowania
* Adresat: Komendant Straży Miejskiej
* Podstawy prawne: ustawa o strażach gminnych, art. 97 KPW
M5. Odwołanie od mandatu ITD (mandat_odwolanie_itd)
* Cena: 99 zł
* Deadline: 7 dni
* Formularz: specyficzne dla ITD — kontrola ciężarówki, tachograf, czas pracy, waga, wymiary, zezwolenia
* Adresat: Wojewódzki Inspektorat Transportu Drogowego
* Podstawy prawne: ustawa o transporcie drogowym, rozporządzenie o czasie pracy kierowców
M6. Wniosek o odroczenie/rozłożenie na raty (mandat_odroczenie_raty)
* Cena: 79 zł
* Deadline: brak ścisłego
* Formularz: numer mandatu, kwota, sytuacja finansowa (dochód, wydatki, osoby na utrzymaniu), wnioskowana kwota raty
* Adresat: organ wystawiający mandat
* Pismo: wniosek o rozłożenie grzywny na raty + oświadczenie o stanie majątkowym
M7. Wniosek o uchylenie/korektę punktów karnych (mandat_uchylenie_punktow)
* Cena: 79 zł
* Formularz: numer prawa jazdy, aktualna liczba punktów, kwestionowane wpisy (data, zdarzenie, przypisane punkty), powód korekty
* Adresat: Komendant Wojewódzki Policji (ewidencja kierowców)
* Pismo: wniosek o weryfikację i korektę wpisów w ewidencji kierowców
Kategoria 2: PARKING I KOMUNIKACJA (4 typy)
P1. Sprzeciw od wezwania za parking prywatny (parking_sprzeciw_prywatny)
* Cena: 99 zł
* Deadline: termin z wezwania (zwykle 14 dni)
* Formularz: operator parkingu (APCOA, EuroPark, inne — pole tekstowe), numer wezwania, data, miejsce parkingu, kwota, powód (checklist): nieczytelne oznakowanie strefy, awaria/brak parkomatu, błąd w numerze rejestracyjnym, nieprawidłowy regulamin parkingu (brak zgody na warunki), brak widocznej informacji o opłatach, parkowanie poza strefą płatną, zapłaciłem ale system nie zarejestrował
* Upload: zdjęcie wezwania + zdjęcie miejsca parkowania
* Adresat: firma zarządzająca parkingiem
* Podstawy prawne: ustawa o ochronie konsumenta, KC art. 3853 (klauzule abuzywne), wyrok TSUE dot. proporcjonalności kar umownych
P2. Reklamacja opłaty ZDM (parking_reklamacja_zdm)
* Cena: 99 zł
* Formularz: miasto, numer wezwania/decyzji, data, numer rejestracyjny, powód: zapłaciłem w aplikacji/parkomacie, awaria systemu, błąd identyfikacji, nieprawidłowa strefa
* Adresat: Zarząd Dróg Miejskich (per miasto)
* Podstawy prawne: ustawa o drogach publicznych art. 13f
P3. Odwołanie od opłaty za brak biletu komunikacji (parking_odwolanie_ztm)
* Cena: 99 zł
* Deadline: 7 dni od kontroli
* Formularz: miasto, operator (ZTM/ZKM/MPK/inne), numer wezwania, data i linia, kwota, powód: posiadałem bilet ale nie mogłem okazać, awaria aplikacji biletowej, brak kontrolera na przystanku (brak oznaczenia strefy), bilet okresowy nie był widoczny (problem z kartą), ulga (legitymacja w domu)
* Adresat: operator komunikacji miejskiej
* Podstawy prawne: regulamin przewozów, ustawa Prawo przewozowe art. 33a
P4. Zgłoszenie błędu identyfikacji pojazdu (parking_blad_identyfikacji)
* Cena: 79 zł
* Formularz: numer wezwania, numer rejestracyjny na wezwaniu vs. rzeczywisty, dowody (zdjęcia)
* Pismo: krótkie pismo z żądaniem anulowania z powodu błędnej identyfikacji