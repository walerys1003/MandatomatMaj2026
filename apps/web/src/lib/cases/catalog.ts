import type { CaseCategory, CaseType, FormSchema } from '@mandatomat/db-types'

/**
 * Katalog metadata typów spraw — używany przez wizard.
 *
 * Frontend NIE pobiera form_schema z bazy w MVP — schematy są tu inline,
 * a `case_type_config` w bazie służy tylko do mapowania case_type → prompt_file
 * i wersji schemy.
 *
 * 29 typów spraw zgodnie ze specyfikacją (M1-M7, P1-P4, W1-W5, U1-U3, E1-E3, K1-K4, T1-T4) —
 * każdy ma odpowiadający prompt w `apps/web/src/lib/ai/prompts/`.
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
    title: 'Pisma pomocnicze',
    description: 'Pełnomocnictwo, RODO, załączniki',
    icon: '🔧',
    slug: 'techniczne',
  },
]

export const CASE_TYPES_META: CaseTypeMeta[] = [
  // === Mandaty (7) ===
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
    type: 'M2_mandat_odmowa_przyjecia',
    category: 'mandaty',
    shortId: 'M2',
    title: 'Odmowa przyjęcia mandatu',
    description: 'Sprawa do sądu rejonowego. Art. 97 § 2 KPSW.',
    icon: '✋',
    mvp: true,
    price: 99,
  },
  {
    type: 'M3_mandat_uchylenie',
    category: 'mandaty',
    shortId: 'M3',
    title: 'Uchylenie prawomocnego mandatu',
    description: 'Wniosek do sądu. Art. 101 § 1 KPSW (3 przesłanki).',
    icon: '⚖️',
    mvp: false,
    price: 149,
  },
  {
    type: 'M4_mandat_straz_gminna',
    category: 'mandaty',
    shortId: 'M4',
    title: 'Odwołanie — mandat straży gminnej/miejskiej',
    description: 'Niezapięte pasy, wykroczenie porządkowe.',
    icon: '👮',
    mvp: true,
    price: 99,
  },
  {
    type: 'M5_mandat_straz_fotoradar',
    category: 'mandaty',
    shortId: 'M5',
    title: 'Odwołanie — fotoradar straży miejskiej',
    description: 'Brak kompetencji SM/SG do fotoradarów mobilnych od 2016.',
    icon: '📷',
    mvp: false,
    price: 99,
  },
  {
    type: 'M6_mandat_itd',
    category: 'mandaty',
    shortId: 'M6',
    title: 'Odwołanie — kara ITD',
    description: 'Inspekcja Transportu Drogowego (czas pracy, masa).',
    icon: '🚛',
    mvp: false,
    price: 149,
  },
  {
    type: 'M7_mandat_odroczenie_raty',
    category: 'mandaty',
    shortId: 'M7',
    title: 'Wniosek — odroczenie / rozłożenie na raty',
    description: 'Trudna sytuacja finansowa. Art. 67a Ordynacji.',
    icon: '💸',
    mvp: false,
    price: 79,
  },

  // === Parking (4) ===
  {
    type: 'P1_parking_spp',
    category: 'parking',
    shortId: 'P1',
    title: 'Reklamacja — opłata dodatkowa SPP',
    description: 'Strefa płatnego parkowania.',
    icon: '🅿️',
    mvp: true,
    price: 99,
  },
  {
    type: 'P2_parking_zdm',
    category: 'parking',
    shortId: 'P2',
    title: 'Reklamacja — opłata dodatkowa ZDM',
    description: 'Zarząd Dróg Miejskich — błędne wystawienie.',
    icon: '🛣️',
    mvp: false,
    price: 99,
  },
  {
    type: 'P3_parking_ztm',
    category: 'parking',
    shortId: 'P3',
    title: 'Odwołanie — bilet ZTM/MPK/komunikacja',
    description: 'Opłata dodatkowa za jazdę bez biletu.',
    icon: '🚌',
    mvp: true,
    price: 99,
  },
  {
    type: 'P4_parking_blad_identyfikacji',
    category: 'parking',
    shortId: 'P4',
    title: 'Sprzeciw — błąd identyfikacji ANPR',
    description: 'Pomyłka w odczycie tablicy (O↔0, I↔1, B↔8).',
    icon: '🔢',
    mvp: false,
    price: 99,
  },

  // === Windykacja (5) ===
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
    type: 'W2_windykacja_odpowiedz',
    category: 'windykacja',
    shortId: 'W2',
    title: 'Odpowiedź na wezwanie windykacyjne',
    description: 'Kwestionowanie istnienia / wysokości długu.',
    icon: '✉️',
    mvp: true,
    price: 99,
  },
  {
    type: 'W3_windykacja_sprzeciw_epu',
    category: 'windykacja',
    shortId: 'W3',
    title: 'Sprzeciw od nakazu zapłaty (EPU)',
    description: 'Sąd Lublin-Zachód, 14 dni termin. Art. 503 § 1 KPC.',
    icon: '🏛️',
    mvp: true,
    price: 99,
  },
  {
    type: 'W4_windykacja_krd_bik',
    category: 'windykacja',
    shortId: 'W4',
    title: 'Usunięcie wpisu KRD/BIK/ERIF',
    description: 'UUIG art. 14/21/30, RODO art. 16/17.',
    icon: '🗂️',
    mvp: false,
    price: 99,
  },
  {
    type: 'W5_windykacja_skarga_rf',
    category: 'windykacja',
    shortId: 'W5',
    title: 'Skarga do RF na windykatora',
    description: 'Klauzule abuzywne, niedozwolone praktyki.',
    icon: '📮',
    mvp: false,
    price: 99,
  },

  // === Ubezpieczenia (3) ===
  {
    type: 'U1_ubezp_odwolanie_decyzja',
    category: 'ubezpieczenia',
    shortId: 'U1',
    title: 'Odwołanie — decyzja ubezpieczyciela',
    description: 'OC/AC/NNW. Zaniżenie / odmowa wypłaty.',
    icon: '🛡️',
    mvp: false,
    price: 149,
  },
  {
    type: 'U2_ubezp_wezwanie_wyplata',
    category: 'ubezpieczenia',
    shortId: 'U2',
    title: 'Wezwanie do wypłaty odszkodowania',
    description: 'Przed pozwem. Art. 14 ust. obow., art. 817 KC.',
    icon: '💰',
    mvp: false,
    price: 99,
  },
  {
    type: 'U3_ubezp_skarga_rf',
    category: 'ubezpieczenia',
    shortId: 'U3',
    title: 'Skarga do RF na ubezpieczyciela',
    description: 'Interwencja lub mediacja. Art. 17/35 ustawy o RF.',
    icon: '⚖️',
    mvp: false,
    price: 99,
  },

  // === e-TOLL (3) ===
  {
    type: 'E1_etoll_odwolanie_kara',
    category: 'etoll',
    shortId: 'E1',
    title: 'Odwołanie od kary GITD e-TOLL',
    description: 'KPA — 14 dni od doręczenia. Art. 13hb ustawy o drogach.',
    icon: '🛣️',
    mvp: false,
    price: 99,
  },
  {
    type: 'E2_etoll_reklamacja_podwojne',
    category: 'etoll',
    shortId: 'E2',
    title: 'Reklamacja — podwójne naliczenie',
    description: 'Duplikat transakcji, błąd ANPR, awaria.',
    icon: '🔄',
    mvp: false,
    price: 99,
  },
  {
    type: 'E3_etoll_anulowanie',
    category: 'etoll',
    shortId: 'E3',
    title: 'Wniosek — umorzenie / odstąpienie / raty',
    description: 'Art. 105/189f/189k KPA — okoliczności łagodzące.',
    icon: '📉',
    mvp: false,
    price: 99,
  },

  // === Kontrole (4) ===
  {
    type: 'K1_kontrola_zatrzymanie_pj',
    category: 'kontrole',
    shortId: 'K1',
    title: 'Sprzeciw — zatrzymanie prawa jazdy',
    description: 'Art. 135 PoRD, art. 102 ustawy o kierujących.',
    icon: '🪪',
    mvp: false,
    price: 149,
  },
  {
    type: 'K2_kontrola_cofniecie_cepik',
    category: 'kontrole',
    shortId: 'K2',
    title: 'Cofnięcie decyzji o cofnięciu uprawnień',
    description: 'Wzruszenie decyzji starosty. Art. 154-156 KPA.',
    icon: '🔄',
    mvp: false,
    price: 149,
  },
  {
    type: 'K3_kontrola_weryfikacja_urzadzenia',
    category: 'kontrole',
    shortId: 'K3',
    title: 'Weryfikacja urządzenia pomiarowego',
    description: 'Świadectwo legalizacji, opinia biegłego.',
    icon: '🔍',
    mvp: false,
    price: 149,
  },
  {
    type: 'K4_kontrola_korekta_punktow',
    category: 'kontrole',
    shortId: 'K4',
    title: 'Korekta punktów karnych w CEPiK',
    description: 'Upływ terminu, uchylony mandat, błąd urzędniczy.',
    icon: '🎯',
    mvp: false,
    price: 79,
  },

  // === Techniczne / pomocnicze (4) ===
  {
    type: 'T1_techn_pelnomocnictwo',
    category: 'techniczne',
    shortId: 'T1',
    title: 'Pełnomocnictwo',
    description: 'Procesowe / administracyjne / podatkowe / ubezpieczeniowe.',
    icon: '✍️',
    mvp: true,
    price: 49,
  },
  {
    type: 'T2_techn_rodo_dostep',
    category: 'techniczne',
    shortId: 'T2',
    title: 'Wniosek RODO — dostęp do danych',
    description: 'Art. 15 RODO. Bezpłatny pierwszy egzemplarz.',
    icon: '👁️',
    mvp: true,
    price: 49,
  },
  {
    type: 'T3_techn_rodo_usuniecie',
    category: 'techniczne',
    shortId: 'T3',
    title: 'Wniosek RODO — usunięcie danych',
    description: 'Prawo do bycia zapomnianym. Art. 17 RODO.',
    icon: '🗑️',
    mvp: false,
    price: 49,
  },
  {
    type: 'T4_techn_lista_zalacznikow',
    category: 'techniczne',
    shortId: 'T4',
    title: 'Lista załączników do pisma',
    description: 'Generator dla każdej kategorii sprawy.',
    icon: '📋',
    mvp: true,
    price: 0,
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
