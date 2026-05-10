import type { CaseCategory, CaseType, FormSchema } from '@mandatomat/db-types'

/**
 * Katalog metadata typów spraw — używany przez wizard.
 *
 * Frontend NIE pobiera form_schema z bazy w MVP — schematy są tu inline,
 * a `case_type_config` w bazie służy tylko do mapowania case_type → prompt_file
 * i wersji schemy.
 *
 * Po MVP: form_schema lectured z bazy (chunk T07 sekcja 2.6, migracja
 * 015_form_schema_versioning).
 */

export interface CaseTypeMeta {
  type: CaseType
  category: CaseCategory
  /** Krótki ID wewnętrzny (np. "M1"). */
  shortId: string
  /** Tytuł wyświetlany w UI. */
  title: string
  /** Krótki opis (1 linia). */
  description: string
  /** Emoji icon (Mandatomat preferuje emoji nad SVG dla szybkości). */
  icon: string
  /** Czy dostępne w MVP. */
  mvp: boolean
  /** Cena bazowa w PLN (pay-per-doc). */
  price: number
}

export interface CategoryMeta {
  id: CaseCategory
  title: string
  description: string
  icon: string
  /** Slug dla URL (`/sprawy/nowa/[slug]`). */
  slug: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'mandaty',
    title: 'Mandaty karne',
    description: 'Drogowe, fotoradar, art. 92a KW',
    icon: '🚓',
    slug: 'mandaty',
  },
  {
    id: 'parking',
    title: 'Parking',
    description: 'Strefa płatna, ZTM, prywatne',
    icon: '🅿️',
    slug: 'parking',
  },
  {
    id: 'windykacja',
    title: 'Windykacja',
    description: 'Wezwania, EPU, przedawnienie',
    icon: '💼',
    slug: 'windykacja',
  },
  {
    id: 'ubezpieczenia',
    title: 'Ubezpieczenia',
    description: 'OC/AC, odszkodowanie, regres',
    icon: '🛡️',
    slug: 'ubezpieczenia',
  },
  {
    id: 'etoll',
    title: 'e-TOLL',
    description: 'Brak rejestracji, awaria, błąd',
    icon: '🛣️',
    slug: 'etoll',
  },
  {
    id: 'kontrole',
    title: 'Kontrole drogowe',
    description: 'Alkomat, prawo jazdy, ITD',
    icon: '⚠️',
    slug: 'kontrole',
  },
  {
    id: 'techniczne',
    title: 'Pisma techniczne',
    description: 'Badanie techniczne, OC, dowód',
    icon: '🔧',
    slug: 'techniczne',
  },
]

export const CASE_TYPES_META: CaseTypeMeta[] = [
  // === Mandaty ===
  {
    type: 'M1_mandat_predkosc',
    category: 'mandaty',
    shortId: 'M1',
    title: 'Sprzeciw — przekroczenie prędkości',
    description: 'Fotoradar, lidar, patrol. Art. 92a § 1 KW.',
    icon: '📸',
    mvp: true,
    price: 99,
  },
  {
    type: 'M2_mandat_skrzyzowanie',
    category: 'mandaty',
    shortId: 'M2',
    title: 'Sprzeciw — naruszenie zasad na skrzyżowaniu',
    description: 'Pierwszeństwo, czerwone światło, znak STOP.',
    icon: '🚦',
    mvp: false,
    price: 99,
  },
  {
    type: 'M3_mandat_telefon',
    category: 'mandaty',
    shortId: 'M3',
    title: 'Sprzeciw — telefon w trakcie jazdy',
    description: 'Art. 45 ust. 2 pkt 1 PoRD.',
    icon: '📱',
    mvp: false,
    price: 99,
  },
  {
    type: 'M4_mandat_pasy',
    category: 'mandaty',
    shortId: 'M4',
    title: 'Odwołanie — straż miejska',
    description: 'Mandat z radarów straży miejskiej / gminnej.',
    icon: '👮',
    mvp: true,
    price: 99,
  },
  {
    type: 'M5_mandat_parkowanie',
    category: 'mandaty',
    shortId: 'M5',
    title: 'Sprzeciw — niewłaściwe parkowanie',
    description: 'Mandat policyjny / strażniczy za parkowanie.',
    icon: '🚗',
    mvp: false,
    price: 99,
  },
  {
    type: 'M6_mandat_dokumenty',
    category: 'mandaty',
    shortId: 'M6',
    title: 'Sprzeciw — brak dokumentów',
    description: 'Brak prawa jazdy, dowodu rejestracyjnego, OC.',
    icon: '📋',
    mvp: false,
    price: 99,
  },
  {
    type: 'M7_mandat_inny',
    category: 'mandaty',
    shortId: 'M7',
    title: 'Inny mandat karny',
    description: 'Pozostałe wykroczenia drogowe.',
    icon: '⚖️',
    mvp: false,
    price: 99,
  },

  // === Parking ===
  {
    type: 'P1_parking_strefa_platna',
    category: 'parking',
    shortId: 'P1',
    title: 'Reklamacja — opłata dodatkowa SPP',
    description: 'Strefa płatnego parkowania (ZDM, MZD, MZK).',
    icon: '🅿️',
    mvp: true,
    price: 99,
  },
  {
    type: 'P2_parking_zakaz_postoju',
    category: 'parking',
    shortId: 'P2',
    title: 'Sprzeciw — zakaz postoju / zatrzymywania',
    description: 'Mandat za parkowanie w niedozwolonym miejscu.',
    icon: '⛔',
    mvp: false,
    price: 99,
  },
  {
    type: 'P3_parking_oplata_dodatkowa',
    category: 'parking',
    shortId: 'P3',
    title: 'Odwołanie — bilet ZTM/MPK/komunikacja',
    description: 'Opłata dodatkowa za jazdę bez biletu.',
    icon: '🚌',
    mvp: true,
    price: 99,
  },
  {
    type: 'P4_parking_holowanie',
    category: 'parking',
    shortId: 'P4',
    title: 'Reklamacja — odholowanie pojazdu',
    description: 'Koszty holowania, przechowywania na parkingu.',
    icon: '🚛',
    mvp: false,
    price: 99,
  },

  // === Windykacja ===
  {
    type: 'W1_windykacja_przedawnienie',
    category: 'windykacja',
    shortId: 'W1',
    title: 'Odpowiedź na wezwanie — przedawnienie',
    description: 'Zarzut przedawnienia roszczenia (art. 117 KC).',
    icon: '⏱️',
    mvp: true,
    price: 99,
  },
  {
    type: 'W2_windykacja_brak_dlugu',
    category: 'windykacja',
    shortId: 'W2',
    title: 'Odpowiedź na wezwanie — brak długu',
    description: 'Kwestionowanie istnienia / wysokości długu.',
    icon: '❓',
    mvp: false,
    price: 99,
  },
  {
    type: 'W3_windykacja_naruszenie_rodo',
    category: 'windykacja',
    shortId: 'W3',
    title: 'Sprzeciw — naruszenie RODO przez windykatora',
    description: 'Nielegalne przetwarzanie danych, zgłoszenie do UODO.',
    icon: '🔒',
    mvp: false,
    price: 99,
  },
  {
    type: 'W4_windykacja_komornik',
    category: 'windykacja',
    shortId: 'W4',
    title: 'Skarga na komornika',
    description: 'Niewłaściwe egzekucja, błędne zajęcie.',
    icon: '📜',
    mvp: false,
    price: 149,
  },
  {
    type: 'W5_windykacja_bik',
    category: 'windykacja',
    shortId: 'W5',
    title: 'Reklamacja BIK',
    description: 'Błędny wpis w bazie BIK / KRD / ERIF.',
    icon: '📊',
    mvp: false,
    price: 99,
  },

  // === Ubezpieczenia ===
  {
    type: 'U1_ubezp_odmowa_wyplaty',
    category: 'ubezpieczenia',
    shortId: 'U1',
    title: 'Odwołanie — odmowa wypłaty odszkodowania',
    description: 'Spór z ubezpieczycielem (OC, AC, NW).',
    icon: '🛡️',
    mvp: false,
    price: 149,
  },
  {
    type: 'U2_ubezp_zanizone',
    category: 'ubezpieczenia',
    shortId: 'U2',
    title: 'Odwołanie — zaniżone odszkodowanie',
    description: 'Wypłata niższa niż szkoda, kwestionowanie wyceny.',
    icon: '💰',
    mvp: false,
    price: 149,
  },
  {
    type: 'U3_ubezp_oc_komunikacyjne',
    category: 'ubezpieczenia',
    shortId: 'U3',
    title: 'Reklamacja — kara za brak OC',
    description: 'UFG — kara za brak ciągłości polisy.',
    icon: '🚙',
    mvp: false,
    price: 99,
  },

  // === e-TOLL ===
  {
    type: 'E1_etoll_brak_oplaty',
    category: 'etoll',
    shortId: 'E1',
    title: 'Sprzeciw — kara za brak opłaty e-TOLL',
    description: 'Mandat za przejazd bez naliczonej opłaty.',
    icon: '🛣️',
    mvp: false,
    price: 99,
  },
  {
    type: 'E2_etoll_naruszenie',
    category: 'etoll',
    shortId: 'E2',
    title: 'Odwołanie — naruszenie obowiązku e-TOLL',
    description: 'Awaria urządzenia, brak rejestracji.',
    icon: '⚙️',
    mvp: false,
    price: 99,
  },
  {
    type: 'E3_etoll_blad_systemu',
    category: 'etoll',
    shortId: 'E3',
    title: 'Reklamacja — błędne naliczenie opłaty',
    description: 'Podwójne pobranie, błędna kategoria pojazdu.',
    icon: '🔄',
    mvp: false,
    price: 99,
  },

  // === Kontrole ===
  {
    type: 'K1_kontrola_alkomat',
    category: 'kontrole',
    shortId: 'K1',
    title: 'Sprzeciw — wynik alkomatu',
    description: 'Kwestionowanie pomiaru, brak świadectwa wzorcowania.',
    icon: '🍷',
    mvp: false,
    price: 149,
  },
  {
    type: 'K2_kontrola_przeszukanie',
    category: 'kontrole',
    shortId: 'K2',
    title: 'Skarga — przeszukanie pojazdu',
    description: 'Kwestionowanie podstawy, naruszenie procedur.',
    icon: '🔍',
    mvp: false,
    price: 149,
  },
  {
    type: 'K3_kontrola_zatrzymanie_prawa_jazdy',
    category: 'kontrole',
    shortId: 'K3',
    title: 'Wniosek — zwrot prawa jazdy',
    description: 'Po zatrzymaniu przez policję / sąd.',
    icon: '📇',
    mvp: false,
    price: 99,
  },
  {
    type: 'K4_kontrola_inne',
    category: 'kontrole',
    shortId: 'K4',
    title: 'Inne — kontrola drogowa',
    description: 'ITD, masa, czas pracy kierowcy.',
    icon: '🚛',
    mvp: false,
    price: 99,
  },

  // === Techniczne ===
  {
    type: 'T1_techn_brak_badan',
    category: 'techniczne',
    shortId: 'T1',
    title: 'Sprzeciw — kara za brak badań technicznych',
    description: 'Mandat za brak aktualnego badania.',
    icon: '🔧',
    mvp: false,
    price: 99,
  },
  {
    type: 'T2_techn_negatywny_wynik',
    category: 'techniczne',
    shortId: 'T2',
    title: 'Odwołanie — negatywny wynik badania',
    description: 'Spór z diagnostą / SKP.',
    icon: '🛠️',
    mvp: false,
    price: 99,
  },
  {
    type: 'T3_techn_oc_badanie',
    category: 'techniczne',
    shortId: 'T3',
    title: 'Reklamacja — związek OC z badaniem',
    description: 'Niewłaściwe rozliczenie polisy.',
    icon: '📑',
    mvp: false,
    price: 99,
  },
  {
    type: 'T4_techn_zatrzymanie_dowodu',
    category: 'techniczne',
    shortId: 'T4',
    title: 'Wniosek — zwrot dowodu rejestracyjnego',
    description: 'Po zatrzymaniu przez kontrolę.',
    icon: '📄',
    mvp: false,
    price: 99,
  },
]

// === Helpers ===

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getCaseTypeMeta(type: CaseType | string): CaseTypeMeta | undefined {
  return CASE_TYPES_META.find((t) => t.type === type)
}

export function getCaseTypesByCategory(category: CaseCategory): CaseTypeMeta[] {
  return CASE_TYPES_META.filter((t) => t.category === category)
}

export function getMvpCaseTypes(): CaseTypeMeta[] {
  return CASE_TYPES_META.filter((t) => t.mvp)
}

/** Slug dla URL — używa shortId jako ID w URL (`/sprawy/nowa/mandaty/m1`). */
export function caseTypeUrlSlug(meta: CaseTypeMeta): string {
  return meta.shortId.toLowerCase()
}

export function getCaseTypeBySlug(category: string, slug: string): CaseTypeMeta | undefined {
  return CASE_TYPES_META.find(
    (t) =>
      CATEGORIES.find((c) => c.id === t.category)?.slug === category &&
      caseTypeUrlSlug(t) === slug,
  )
}

/** Lazy-load form schema (5 MVP types) — żeby uniknąć kopania całej bazy w bundle. */
export async function loadFormSchema(type: CaseType): Promise<FormSchema | null> {
  const m = await import('./schemas')
  return m.FORM_SCHEMAS[type] ?? null
}
