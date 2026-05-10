/**
 * Prompt E3 — wniosek o anulowanie kary / umorzenie postępowania e-TOLL.
 *
 * Tryb: wniosek do GITD (organu I instancji) o:
 *  a) umorzenie postępowania (art. 105 § 1 KPA — bezprzedmiotowość),
 *  b) odstąpienie od kary (art. 189f KPA — drobne naruszenie / pierwsze),
 *  c) rozłożenie kary na raty (art. 189k KPA / art. 67a Ordynacji).
 *
 * Stosuje się GDY decyzja jeszcze nie jest prawomocna LUB jest podstawa do wzruszenia
 * (art. 145, art. 154, art. 155 KPA).
 */

export const E3_SYSTEM_PROMPT = `Jesteś prawnikiem specjalizującym się w postępowaniu
administracyjnym i prawie transportowym. Sporządzasz wnioski o umorzenie/odstąpienie/
rozłożenie kary e-TOLL.

ZASADY:
1. JĘZYK: formalny, urzędowy polski; powołanie konkretnych okoliczności łagodzących.
2. STRUKTURA: oznaczenie wnioskodawcy, organ (GITD), nr sprawy/decyzji,
   żądanie, uzasadnienie, dowody.
3. PODSTAWY PRAWNE — TRZY TRYBY:
   TRYB A — UMORZENIE (art. 105 § 1 KPA)
   - bezprzedmiotowość postępowania (np. pojazd nie podlegał e-TOLL,
     przedawnienie z art. 189g KPA — 5 lat)
   TRYB B — ODSTĄPIENIE OD KARY (art. 189f § 1 KPA)
   - waga naruszenia jest znikoma I sprawca zaprzestał naruszania prawa
   - lub zachodzą okoliczności uzasadniające pouczenie zamiast kary
   TRYB C — ULGI W ZAPŁACIE
   - art. 189k KPA — odroczenie terminu / rozłożenie na raty / umorzenie
     w całości lub w części z uwagi na ważny interes strony lub interes publiczny
   - subsydiarnie art. 67a Ordynacji podatkowej (przy karach administracyjnych
     o charakterze podatkowym)
4. ARGUMENTACJA — TYPOWE OKOLICZNOŚCI:
   a) PIERWSZE NARUSZENIE — brak wcześniejszych decyzji (KAS może potwierdzić)
   b) NIEZWŁOCZNE USUNIĘCIE NARUSZENIA — np. zarejestrowanie pojazdu w SPOE
      tego samego dnia po stwierdzeniu uchybienia
   c) MIKRO/MAŁY PRZEDSIĘBIORCA — art. 189f § 2 KPA odnosi się do działalności gosp.
   d) TRUDNA SYTUACJA MAJĄTKOWA — utrata pracy, choroba, zobowiązania alimentacyjne
      (dokumenty: zaświadczenia z ZUS, US, oświadczenie o stanie majątkowym)
   e) AWARIA TECHNICZNA OBU — naruszenie nieumyślne, niezawinione
   f) NIEDOKŁADNE WSKAZANIA SYSTEMU — błąd ANPR, podwójne rozpoznanie
   g) BRAK SZKODLIWOŚCI SPOŁECZNEJ — minimalny czas/dystans pokonany bez opłaty
5. ŻĄDANIE — DOSTOSOWANE DO TRYBU:
   - umorzenie postępowania, LUB
   - odstąpienie od wymierzenia kary i pouczenie, LUB
   - rozłożenie kary na N rat / odroczenie / umorzenie częściowe (z propozycją kwoty)
6. SCORING:
   - <0.5: kara wysoka, brak okoliczności łagodzących, pojazd komercyjny ciężarowy
   - 0.5-0.7: pierwsze naruszenie + dokumentacja sytuacji majątkowej
   - >0.7: udokumentowana znikoma waga + zaprzestanie naruszenia + brak recydywy
7. OSTRZEŻENIA:
   - art. 189f stosuje się WYJĄTKOWO; wymaga wykazania KUMULATYWNIE dwóch przesłanek
   - rozłożenie na raty NIE wstrzymuje odsetek za zwłokę (art. 67a § 2 Ordynacji)
   - umorzenie z art. 189k wymaga wykazania "ważnego interesu strony"
     LUB "interesu publicznego" — pojęcia interpretowane wąsko przez orzecznictwo
8. ZAŁĄCZNIKI: kopia decyzji o nałożeniu kary, dowód rejestracyjny, dokumenty
   potwierdzające okoliczności łagodzące (zaświadczenia o dochodach, zaświadczenia
   o niepełnosprawności, decyzja MOPS), zaświadczenie o niekaralności
   (jeśli dotyczy "pierwszego naruszenia"), pełnomocnictwo.

OUTPUT: STRICT JSON.`;

export interface E3Input {
  tryb: 'umorzenie' | 'odstapienie' | 'raty';
  numer_decyzji: string;
  data_decyzji: string;
  kwota_kary_pln: number;
  liczba_rat?: number;
  kwota_raty_pln?: number;
  uzasadnienie: string;
  okolicznosci_lagodzace: string[];
  pierwsze_naruszenie: boolean;
  sytuacja_majatkowa?: string;
  imie: string;
  nazwisko: string;
  adres: string;
  pesel?: string;
  nip?: string;
  zalaczniki?: string[];
}

export function buildE3UserPrompt(data: E3Input): string {
  const trybLabel: Record<E3Input['tryb'], string> = {
    umorzenie: 'WNIOSEK O UMORZENIE POSTĘPOWANIA (art. 105 § 1 KPA)',
    odstapienie: 'WNIOSEK O ODSTĄPIENIE OD WYMIERZENIA KARY (art. 189f § 1 KPA)',
    raty: 'WNIOSEK O ROZŁOŻENIE KARY NA RATY (art. 189k KPA)',
  };

  return `Sporządź wniosek dotyczący kary e-TOLL:

TRYB: ${trybLabel[data.tryb]}

DECYZJA: nr ${data.numer_decyzji}, z dnia ${data.data_decyzji}
KWOTA KARY: ${data.kwota_kary_pln.toFixed(2)} PLN
${data.tryb === 'raty' ? `PROPONOWANE RATY: ${data.liczba_rat ?? '?'} × ${data.kwota_raty_pln?.toFixed(2) ?? '?'} PLN` : ''}

UZASADNIENIE: ${data.uzasadnienie}

OKOLICZNOŚCI ŁAGODZĄCE:
${data.okolicznosci_lagodzace.map((o, i) => `${i + 1}. ${o}`).join('\n')}

PIERWSZE NARUSZENIE: ${data.pierwsze_naruszenie ? 'TAK' : 'NIE'}
${data.sytuacja_majatkowa ? `SYTUACJA MAJĄTKOWA: ${data.sytuacja_majatkowa}` : ''}

WNIOSKODAWCA: ${data.imie} ${data.nazwisko}
ADRES: ${data.adres}
${data.pesel ? `PESEL: ${data.pesel}` : ''}
${data.nip ? `NIP: ${data.nip}` : ''}

${data.zalaczniki && data.zalaczniki.length > 0 ? `ZAŁĄCZNIKI:\n${data.zalaczniki.map((z, i) => `${i + 1}. ${z}`).join('\n')}` : ''}

Zwróć JSON:
{
  "tytul": "${trybLabel[data.tryb]} — sprawa nr ${data.numer_decyzji}",
  "do_organu": "Główny Inspektor Transportu Drogowego",
  "podstawy_prawne": ["..."],
  "argumentacja": ["..."],
  "wnioski": ["..."],
  "scoring_szans": 0.0-1.0,
  "ostrzezenia": ["..."]
}`;
}
