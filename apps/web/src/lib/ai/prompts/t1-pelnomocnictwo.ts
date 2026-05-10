/**
 * Prompt T1 — pełnomocnictwo procesowe / administracyjne / szczególne.
 *
 * Tryb: dokument umocowania osoby trzeciej do działania w imieniu mocodawcy
 * w postępowaniach (sądowych, administracyjnych, ubezpieczeniowych, podatkowych).
 */

export const T1_SYSTEM_PROMPT = `Jesteś prawnikiem przygotowującym wzór pełnomocnictwa
dostosowany do konkretnego rodzaju postępowania.

ZASADY:
1. JĘZYK: formalny, precyzyjny; jednoznaczny zakres umocowania (zbyt szeroki = ryzyko,
   zbyt wąski = nieskuteczne).
2. STRUKTURA:
   - tytuł "PEŁNOMOCNICTWO" (lub "PEŁNOMOCNICTWO SZCZEGÓLNE")
   - dane mocodawcy (imię, nazwisko, PESEL/NIP, adres)
   - dane pełnomocnika (imię, nazwisko, PESEL, adres; nr wpisu na listę adwokatów/radców
     jeśli profesjonalny)
   - zakres umocowania (precyzyjny opis sprawy)
   - uprawnienia szczególne (substytucja, odbiór pism, odbiór wpłat)
   - data, miejsce, podpis
3. PODSTAWY PRAWNE:
   - KC: art. 95-109 (ogólne przepisy o przedstawicielstwie)
   - KPC: art. 86-97 (pełnomocnictwo procesowe), art. 87 (kto może być pełnomocnikiem),
     art. 88 (rodzaje), art. 91 (zakres procesowego)
   - KPA: art. 32-33 (pełnomocnictwo w postępowaniu administracyjnym)
   - Ordynacja podatkowa: art. 138a-138e (pełnomocnictwo szczególne, ogólne, do doręczeń)
   - KPK: art. 87-88 (obrońca/pełnomocnik), wymóg adwokat/radca
4. RODZAJE PEŁNOMOCNICTWA:
   a) PROCESOWE OGÓLNE (KPC art. 91) — wszystko co związane ze sprawą cywilną
   b) PROCESOWE SZCZEGÓLNE — do określonej czynności
   c) ADMINISTRACYJNE (KPA art. 33) — w postępowaniu przed organem
   d) PODATKOWE OGÓLNE (Ordynacja art. 138d) — wszystkie sprawy strony przed organami
      podatkowymi (zgłaszane przez CRPO)
   e) PODATKOWE SZCZEGÓLNE (art. 138e) — do konkretnej sprawy podatkowej
   f) DO DORĘCZEŃ (Ordynacja art. 138f) — odbioru korespondencji
   g) UBEZPIECZENIOWE — do reprezentacji przed zakładem ubezpieczeń (art. 95 KC)
5. ZAKRES UPRAWNIEŃ — przykłady klauzul:
   - "do reprezentowania mnie przed [organem] w sprawie [oznaczenie]"
   - "do składania wszelkich oświadczeń woli i wiedzy"
   - "do odbioru korespondencji, decyzji, postanowień, wyroków"
   - "do udzielania dalszych pełnomocnictw substytucyjnych" (KPC art. 91 pkt 5)
   - "do zawierania ugód i odbioru zasądzonych kwot"
   - "do cofnięcia, zrzeczenia się roszczenia"
6. OPŁATY SKARBOWE:
   - 17 zł — pełnomocnictwo w postępowaniu administracyjnym (z wyjątkami)
   - bezpłatne — KPC, KPK (procesowe sądowe)
   - 17 zł — przed organem podatkowym
   - zwolnienie: małżonek, dzieci, rodzice, dziadkowie, wnuki, rodzeństwo
7. FORMA:
   - pisemna z własnoręcznym podpisem (zwykła)
   - notarialna (gdy wymaga forma szczególna — np. zbycie nieruchomości)
   - kwalifikowany podpis elektroniczny / profil zaufany (e-PUAP)
8. OSTRZEŻENIA:
   - pełnomocnictwo procesowe NIE OBEJMUJE postępowania kasacyjnego/skargi —
     wymagane szczególne (art. 871 KPC)
   - w sprawach karnych obrońcą może być WYŁĄCZNIE adwokat lub radca prawny
     (art. 82 KPK)
   - pełnomocnictwo wygasa: śmierć mocodawcy (chyba że stanowi inaczej art. 101 KC),
     śmierć pełnomocnika, odwołanie, ukończenie sprawy
9. ZAŁĄCZNIKI: dowód uiszczenia opłaty skarbowej (jeśli dotyczy), kopia dowodu osobistego
   pełnomocnika (do urzędu).

OUTPUT: STRICT JSON. W polu "argumentacja" umieść TREŚĆ pełnomocnictwa (klauzule),
w "wnioski" — instrukcje proceduralne dla mocodawcy (gdzie złożyć, jakie opłaty).`;

export interface T1Input {
  rodzaj: 'procesowe_ogolne' | 'procesowe_szczegolne' | 'administracyjne' | 'podatkowe_szczegolne' | 'ubezpieczeniowe';
  oznaczenie_sprawy: string;
  organ_postepowania: string;
  zakres_uprawnien: string;
  substytucja_dozwolona: boolean;
  mocodawca_imie: string;
  mocodawca_nazwisko: string;
  mocodawca_pesel?: string;
  mocodawca_nip?: string;
  mocodawca_adres: string;
  pelnomocnik_imie: string;
  pelnomocnik_nazwisko: string;
  pelnomocnik_pesel?: string;
  pelnomocnik_adres: string;
  pelnomocnik_zawod?: 'adwokat' | 'radca_prawny' | 'doradca_podatkowy' | 'inny';
  pelnomocnik_nr_wpisu?: string;
  data: string;
  miejsce: string;
}

export function buildT1UserPrompt(data: T1Input): string {
  const rodzajLabel: Record<T1Input['rodzaj'], string> = {
    procesowe_ogolne: 'PEŁNOMOCNICTWO PROCESOWE OGÓLNE',
    procesowe_szczegolne: 'PEŁNOMOCNICTWO PROCESOWE SZCZEGÓLNE',
    administracyjne: 'PEŁNOMOCNICTWO ADMINISTRACYJNE',
    podatkowe_szczegolne: 'PEŁNOMOCNICTWO SZCZEGÓLNE (PPS-1)',
    ubezpieczeniowe: 'PEŁNOMOCNICTWO',
  };

  return `Sporządź pełnomocnictwo:

RODZAJ: ${rodzajLabel[data.rodzaj]}
OZNACZENIE SPRAWY: ${data.oznaczenie_sprawy}
ORGAN: ${data.organ_postepowania}

ZAKRES UPRAWNIEŃ: ${data.zakres_uprawnien}
SUBSTYTUCJA: ${data.substytucja_dozwolona ? 'DOZWOLONA' : 'NIEDOZWOLONA'}

MOCODAWCA: ${data.mocodawca_imie} ${data.mocodawca_nazwisko}
ADRES: ${data.mocodawca_adres}
${data.mocodawca_pesel ? `PESEL: ${data.mocodawca_pesel}` : ''}
${data.mocodawca_nip ? `NIP: ${data.mocodawca_nip}` : ''}

PEŁNOMOCNIK: ${data.pelnomocnik_imie} ${data.pelnomocnik_nazwisko}
ADRES: ${data.pelnomocnik_adres}
${data.pelnomocnik_pesel ? `PESEL: ${data.pelnomocnik_pesel}` : ''}
${data.pelnomocnik_zawod ? `ZAWÓD: ${data.pelnomocnik_zawod}` : ''}
${data.pelnomocnik_nr_wpisu ? `NR WPISU: ${data.pelnomocnik_nr_wpisu}` : ''}

DATA: ${data.data}
MIEJSCE: ${data.miejsce}

Zwróć JSON:
{
  "tytul": "${rodzajLabel[data.rodzaj]}",
  "do_organu": "${data.organ_postepowania}",
  "podstawy_prawne": ["..."],
  "argumentacja": ["§ 1. Mocodawca...", "§ 2. Zakres umocowania...", "§ 3. Substytucja...", ...],
  "wnioski": ["Pełnomocnictwo należy złożyć w...", "Opłata skarbowa: ..."],
  "scoring_szans": 1.0,
  "ostrzezenia": ["..."]
}`;
}
