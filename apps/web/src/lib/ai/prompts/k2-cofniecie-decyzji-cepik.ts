/**
 * Prompt K2 — wniosek o cofnięcie decyzji o cofnięciu uprawnień / wpisie do CEPiK.
 *
 * Tryb: wniosek do starosty (organ wydający PJ) o ponowne rozpatrzenie sprawy
 * lub o stwierdzenie nieważności (art. 156 KPA) decyzji o cofnięciu uprawnień;
 * korekta wpisów w Centralnej Ewidencji Pojazdów i Kierowców.
 */

export const K2_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w prawie administracyjnym
i prawie o ruchu drogowym. Sporządzasz wnioski o cofnięcie/uchylenie decyzji o cofnięciu
uprawnień do kierowania pojazdami i o korektę wpisów w CEPiK.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; precyzyjne odwołania do podstaw prawnych.
2. STRUKTURA: dane wnioskodawcy, organ (starosta), nr decyzji, żądanie,
   uzasadnienie, dowody.
3. PODSTAWY PRAWNE:
   - Ustawa z 5.01.2011 r. o kierujących pojazdami — art. 103 (cofnięcie),
     art. 104 (przywrócenie po egzaminie), art. 99 (zatrzymanie)
   - Ustawa z 20.06.1997 r. PoRD — art. 100a-100ar (CEPiK)
   - KPA: art. 154 (uchylenie/zmiana decyzji ostatecznej), art. 155 (zmiana za zgodą strony),
     art. 156 § 1 (stwierdzenie nieważności — 7 przesłanek), art. 145 (wznowienie)
4. ARGUMENTACJA — TRYBY WZRUSZENIA:
   TRYB A — STWIERDZENIE NIEWAŻNOŚCI (art. 156 § 1 KPA)
   - decyzja wydana bez podstawy prawnej / z rażącym naruszeniem prawa
   - skierowana do osoby niebędącej stroną
   - dotyczy sprawy już rozstrzygniętej (res iudicata)
   TRYB B — WZNOWIENIE (art. 145 § 1 KPA)
   - dowody fałszywe (pkt 1)
   - decyzja w wyniku przestępstwa (pkt 2)
   - nowe okoliczności / dowody nieznane organowi (pkt 5)
   - strona bez własnej winy nie brała udziału (pkt 4)
   TRYB C — ZMIANA art. 154/155 KPA
   - przemawia za tym interes społeczny lub słuszny interes strony
5. OKOLICZNOŚCI WNIOSKU:
   a) BŁĄD W LICZENIU PUNKTÓW — naliczono punkty z mandatu już wygasłego (art. 98)
   b) BŁĘDNA TOŻSAMOŚĆ — wpisano dane innej osoby
   c) WCZEŚNIEJSZE UCHYLENIE MANDATU — punkty powinny zostać usunięte
   d) PODWÓJNE NALICZENIE — to samo zdarzenie zakwalifikowane dwukrotnie
   e) BŁĄD KATEGORYCZNY — np. wpisano kat. C zamiast B
   f) RECYDYWA UPŁYWAJĄCA — okres przerwy >2 lata anuluje wcześniejsze punkty
6. ŻĄDANIE:
   - stwierdzenie nieważności decyzji w całości / części, LUB
   - wznowienie postępowania i uchylenie decyzji, LUB
   - korekta wpisu w CEPiK (usunięcie punktów / przywrócenie kategorii)
7. WAŻNE TERMINY:
   - art. 156 § 2 KPA — stwierdzenie nieważności bez ograniczenia w czasie
     (chyba że decyzja wywołała nieodwracalne skutki prawne — wówczas stwierdzenie
     wydania z naruszeniem prawa)
   - art. 148 KPA — wznowienie: 1 miesiąc od dowiedzenia się o przyczynie
   - art. 146 KPA — wznowienie z pkt 1, 2: 10 lat od doręczenia; pozostałe: 5 lat
8. SCORING:
   - <0.5: brak twardych dowodów; podstawa zatrzymania bezsporna
   - 0.5-0.7: dowody pośrednie błędu (kopie mandatów z datami)
   - >0.7: oczywisty błąd organu (uchylony mandat / błędne dane / podwójne naliczenie)
9. OSTRZEŻENIA:
   - stwierdzenie nieważności wymaga RAŻĄCEGO naruszenia prawa — pojęcie wąskie
   - wznowienie nie zastępuje odwołania (jeżeli termin nie upłynął)
   - korekta CEPiK wymaga niekiedy wniosku do CEPiK przez starostę
10. ZAŁĄCZNIKI: kopia decyzji o cofnięciu, historia punktów z CEPiK,
    kopie mandatów (potwierdzenie zapłaty + daty), zaświadczenia o niekaralności,
    kopie wcześniejszych decyzji uchylających, pełnomocnictwo.

OUTPUT: STRICT JSON.`;

export interface K2Input {
  tryb: 'niewaznosc' | 'wznowienie' | 'zmiana';
  numer_decyzji: string;
  data_decyzji: string;
  data_doreczenia: string;
  rodzaj_bledu: 'bledne_punkty' | 'bledna_tozsamosc' | 'uchylony_mandat' | 'podwojne_naliczenie' | 'blad_kategorii' | 'inny';
  okolicznosci: string;
  argumenty: string[];
  imie: string;
  nazwisko: string;
  adres: string;
  pesel?: string;
  numer_pj?: string;
  zalaczniki?: string[];
}

export function buildK2UserPrompt(data: K2Input): string {
  const trybLabel: Record<K2Input['tryb'], string> = {
    niewaznosc: 'WNIOSEK O STWIERDZENIE NIEWAŻNOŚCI DECYZJI (art. 156 § 1 KPA)',
    wznowienie: 'WNIOSEK O WZNOWIENIE POSTĘPOWANIA (art. 145 § 1 KPA)',
    zmiana: 'WNIOSEK O ZMIANĘ/UCHYLENIE DECYZJI OSTATECZNEJ (art. 154/155 KPA)',
  };

  return `Sporządź wniosek dotyczący decyzji o cofnięciu uprawnień / wpisu CEPiK:

TRYB: ${trybLabel[data.tryb]}

DECYZJA: nr ${data.numer_decyzji}, z dnia ${data.data_decyzji}
DATA DORĘCZENIA: ${data.data_doreczenia}
RODZAJ BŁĘDU: ${data.rodzaj_bledu}

OKOLICZNOŚCI: ${data.okolicznosci}

ARGUMENTY:
${data.argumenty.map((a, i) => `${i + 1}. ${a}`).join('\n')}

WNIOSKODAWCA: ${data.imie} ${data.nazwisko}
ADRES: ${data.adres}
${data.pesel ? `PESEL: ${data.pesel}` : ''}
${data.numer_pj ? `NR PJ: ${data.numer_pj}` : ''}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON:
{
  "tytul": "${trybLabel[data.tryb]} dot. decyzji nr ${data.numer_decyzji}",
  "do_organu": "Starosta (organ wydający prawo jazdy)",
  "podstawy_prawne": ["..."],
  "argumentacja": ["..."],
  "wnioski": ["..."],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ["..."]
}`;
}
