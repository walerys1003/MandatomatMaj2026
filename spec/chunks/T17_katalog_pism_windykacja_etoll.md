# 9. Katalog pism - Windykacja (W1-W5) + Ubezpieczenia (U1-U3) + e-TOLL (E1-E3) + Kontrole (K1-K4) + Techniczne (T1-T4)

**Chunk ID:** `T17_katalog_pism_windykacja_etoll`
**Source:** tech (lines 2684-2810)
**Tags:** katalog, windykacja, ubezpieczenia, etoll, kontrole, case_types
**Target Agents:** ai, frontend, backend

---

Kategoria 3: WINDYKACJA I EPU (5 typów)
W1. Odpowiedź na wezwanie do zapłaty od firmy windykacyjnej (windykacja_odpowiedz_wezwanie)
* Cena: 99 zł
* Deadline: termin z wezwania (zwykle 7-14 dni)
* Formularz: firma windykacyjna, numer sprawy, kwota, podstawa roszczenia (jeśli znana), stanowisko: nie uznaję roszczenia / uznaję częściowo / przedawnione, powód kwestionowania (checklist): przedawnienie, brak umowy z wierzycielem, spłaciłem/nie zaciągałem, zawyżona kwota, nieudowodnione roszczenie
* Upload: wezwanie do zapłaty → OCR
* Adresat: firma windykacyjna
* Podstawy prawne: KC art. 117-125 (przedawnienie), KC art. 509-518 (cesja)
W2. Zgłoszenie przedawnienia roszczenia (windykacja_przedawnienie)
* Cena: 99 zł
* Formularz: wierzyciel (bank/firma pożyczkowa/fundusz), typ długu (pożyczka, karta kredytowa, rachunek telefoniczny, mandat), data powstania zobowiązania, data ostatniej czynności (wpłata/uznanie), kwota
* Kalkulator przedawnienia (wbudowany): na podstawie typu długu system oblicza termin przedawnienia (2/3/6/10 lat) i sprawdza czy upłynął
* Pismo: zarzut przedawnienia + żądanie zaprzestania dochodzenia
W3. Sprzeciw od nakazu zapłaty EPU (windykacja_sprzeciw_epu)
* Cena: 149 zł (najwyższa w kategorii — najwyższa wartość)
* Deadline: 14 dni od doręczenia
* Formularz: jak w specyfikacji Długomatu D2 — sygnatura, kwota, zarzuty (checklist 7 pozycji)
* Upload: nakaz zapłaty → OCR → auto-fill
* Adresat: Sąd Rejonowy Lublin-Zachód, VI Wydział Cywilny
* Cross-sell: CTA do Długomatu dla pełnej obsługi
* Podstawy prawne: art. 505^35 KPC
W4. Wniosek o usunięcie danych z KRD/BIK (windykacja_usuniecie_krd_bik)
* Cena: 99 zł
* Formularz: instytucja (KRD/BIK/BIG InfoMonitor/ERIF), typ wpisu (zadłużenie/opóźnienie płatności), status długu (spłacony/przedawniony/nigdy nie zaciągnięty), data wpisu, kwota
* Pismo: żądanie usunięcia/aktualizacji danych + powołanie na RODO art. 16-17
W5. Skarga do Rzecznika Finansowego (windykacja_skarga_rf)
* Cena: 99 zł
* Formularz: podmiot (bank/ubezpieczyciel/firma pożyczkowa), opis problemu, dotychczasowe działania (reklamacja/odpowiedź)
* Adresat: Rzecznik Finansowy
* Pismo: skarga z wnioskiem o interwencję
Kategoria 4: UBEZPIECZENIA OC/AC (3 typy)
U1. Odwołanie od decyzji ubezpieczyciela (ubezpieczenie_odwolanie_decyzja)
* Cena: 99 zł
* Formularz: ubezpieczyciel, numer polisy, numer szkody, typ szkody (komunikacyjna/majątkowa/osobowa), kwota wypłacona vs. oczekiwana, powód odwołania: zaniżona wycena, pominięte pozycje, brak uwzględnienia kosztów
* Upload: decyzja ubezpieczyciela, wycena niezależna (opcjonalnie) → OCR
* Adresat: ubezpieczyciel (dział reklamacji)
* Podstawy prawne: KC art. 805-828, ustawa o ubezpieczeniach obowiązkowych
U2. Wezwanie do wypłaty pełnej kwoty odszkodowania (ubezpieczenie_wezwanie_wyplata)
* Cena: 99 zł
* Formularz: jak U1 + żądana kwota wyrównania + termin na wypłatę (14 dni)
* Pismo: wezwanie przedsądowe (dość formalne, z groźbą pozwu)
U3. Skarga do Rzecznika Finansowego — ubezpieczenia (ubezpieczenie_skarga_rf)
* Cena: 99 zł
* Formularz: jak W5, ale specyficzny dla ubezpieczyciela
* Uwaga: Ten typ jest podobny do W5, ale prompt jest specjalizowany pod ubezpieczenia
Kategoria 5: e-TOLL / viaTOLL / AUTOSTRADY (3 typy)
E1. Odwołanie od naliczonej kary e-TOLL/GITD (etoll_odwolanie_kara)
* Cena: 79 zł
* Deadline: 14 dni od doręczenia
* Formularz: numer decyzji, data, kwota kary, odcinek drogi, numer rejestracyjny, powód: awaria urządzenia OBU/aplikacji, podwójne naliczenie, brak informacji o obowiązku opłaty, przejazd po drodze alternatywnej
* Adresat: Główny Inspektor Transportu Drogowego (GITD)
* Podstawy prawne: ustawa o drogach publicznych, ustawa o autostradach płatnych
E2. Reklamacja podwójnego naliczenia (etoll_reklamacja_podwojne)
* Cena: 79 zł
* Formularz: numer konta e-TOLL, data przejazdu, odcinek, dowód podwójnego naliczenia
* Adresat: operator systemu e-TOLL
* Pismo: reklamacja + żądanie korekty/zwrotu
E3. Wniosek o anulowanie opłaty (etoll_anulowanie)
* Cena: 79 zł
* Formularz: numer decyzji, powód (awaria systemu, błąd techniczny, force majeure)
* Pismo: wniosek o anulowanie z uzasadnieniem
Kategoria 6: KONTROLE DROGOWE I PUNKTY KARNE (4 typy)
K1. Sprzeciw od decyzji o zatrzymaniu prawa jazdy (kontrola_sprzeciw_zatrzymanie_pj)
* Cena: 99 zł
* Deadline: 14 dni od doręczenia decyzji
* Formularz: numer decyzji, organ (Starosta/Policja), powód zatrzymania (przekroczenie 24 pkt, jazda pod wpływem, przekroczenie prędkości o 50+ km/h w terenie zabudowanym), argumenty obrony
* Adresat: Samorządowe Kolegium Odwoławcze (SKO)
* Podstawy prawne: ustawa o kierujących pojazdami art. 102
K2. Wniosek o cofnięcie decyzji o zatrzymaniu PJ (kontrola_cofniecie_decyzji)
* Cena: 99 zł
* Formularz: jak K1 + opis zmiany okoliczności
* Pismo: wniosek o ponowne rozpatrzenie / cofnięcie decyzji
K3. Wniosek o weryfikację urządzenia pomiarowego (kontrola_weryfikacja_urzadzenia)
* Cena: 79 zł
* Formularz: typ urządzenia (radar, laserowy, wideorejestracja, fotoradar stacjonarny), numer mandatu, data pomiaru
* Adresat: organ wystawiający mandat
* Pismo: żądanie udostępnienia świadectwa legalizacji, protokołu pomiaru, zapisu kamery
* Podstawy prawne: Prawo o miarach, rozporządzenie o przyrządach pomiarowych, RODO art. 15 (dostęp do danych)
K4. Korekta wpisów w rejestrze punktów karnych (kontrola_korekta_punktow)
* Cena: 79 zł
* Formularz: numer prawa jazdy, kwestionowane wpisy (tabela: data, zdarzenie, punkty), powód korekty
* Adresat: Komendant Wojewódzki Policji
* Pismo: wniosek o weryfikację i sprostowanie
Kategoria 7: PISMA TECHNICZNE (4 typy)
T1. Pełnomocnictwo ogólne (techniczne_pelnomocnictwo)
* Cena: 49 zł
* Formularz: dane mocodawcy, dane pełnomocnika, zakres umocowania (sprawa konkretna / ogólne)
* Pismo: pełnomocnictwo procesowe
T2. Wniosek o dostęp do danych RODO (techniczne_rodo_dostep)
* Cena: 49 zł
* Formularz: instytucja (Policja, Straż Miejska, ZDM, firma parkingowa, ubezpieczyciel), zakres żądanych danych
* Adresat: administrator danych
* Podstawy prawne: RODO art. 15
T3. Wniosek o usunięcie danych RODO (techniczne_rodo_usuniecie)
* Cena: 49 zł
* Formularz: jak T2 + powód usunięcia
* Podstawy prawne: RODO art. 17
T4. Generowana lista załączników (techniczne_lista_zalacznikow)
* Cena: 0 zł (generowana automatycznie z każdym pismem)
* Generowana przez AI jako osobny dokument per sprawa
9.1 Podsumowanie cennika
---------------------------------------------
| |Kategoria | |Typy | |Cena bazowa | |Najwyższa |
---------------------------------------------
| |Mandaty karne | |7 | |79 zł | |99 zł |
---------------------------------------------
| |Parking i komunikacja | |4 | |79 zł | |99 zł |
---------------------------------------------
| |Windykacja i EPU | |5 | |99 zł | |149 zł |
---------------------------------------------
| |Ubezpieczenia OC/AC | |3 | |99 zł | |99 zł |
---------------------------------------------
| |e-TOLL | |3 | |79 zł | |79 zł |
---------------------------------------------
| |Kontrole drogowe | |4 | |79 zł | |99 zł |
---------------------------------------------
| |Pisma techniczne | |4 | |0–49 zł | |49 zł |
---------------------------------------------
| |ŁĄCZNIE | |30 płatnych + 4 tech | | | | |
Pakiet “Kierowca” (subskrypcja): 29 zł/mies., 2 dokumenty/mies. + alerty o terminach + SMS
10. SYSTEM E-WYSYŁKI (V2)
W MVP: Pobranie PDF + instrukcja “jak wysłać samodzielnie” (adres, termin, sposób złożenia).
W V2 (Q3):
* Integracja z ePUAP/Profil Zaufany (API gov.pl(http://gov.pl/))
* Integracja z e-Doręczeniami (ADE)
* Wysyłka emailem z potwierdzeniem doręczenia (Resend + webhook)
* Status tracking: wysłane → doręczone → (odpowiedź)