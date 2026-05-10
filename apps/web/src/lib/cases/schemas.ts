import type { CaseType, FormSchema } from '@mandatomat/db-types'

/**
 * Form Schemas dla 5 typów MVP — Mandatomat.
 *
 * Każdy schema = 2 kroki danych (krok 3 "Podgląd" i krok 4 "Płatność"
 * generowane przez wizard z `extraSteps` w DynamicForm).
 *
 * Konwencje:
 * - Pola z `autoFillFromOcr` zassą się z `uploads.ocr_parsed_data`.
 * - Pola z `aiSuggested: true` w options dostają sparkle ✨ + tooltip.
 * - `conditionalOn` ukrywa/pokazuje pole zależnie od innego.
 * - `width: 'half'` → 2 pola w jednym rzędzie (np. data + kwota).
 *
 * Wersja schemy MUSI rosnąć przy każdej zmianie (form_schema_versioning).
 */

// ============================================================================
// M1 — Sprzeciw od mandatu za przekroczenie prędkości (fotoradar/lidar/patrol)
// ============================================================================

const M1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu',
      description: 'Wpisz dane z mandatu lub załącz zdjęcie — wypełnimy automatycznie.',
      fields: [
        {
          name: 'organ',
          type: 'select',
          label: 'Organ wystawiający mandat',
          required: true,
          options: [
            { value: 'policja', label: 'Policja' },
            { value: 'straz_miejska', label: 'Straż miejska / gminna' },
            { value: 'itd', label: 'Inspekcja Transportu Drogowego (ITD)' },
            { value: 'gitd', label: 'Główny Inspektorat Transportu Drogowego (GITD)' },
          ],
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_mandatu',
          type: 'text',
          label: 'Numer mandatu',
          placeholder: 'np. AB 1234567',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data zdarzenia',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce zdarzenia',
          placeholder: 'np. Warszawa, ul. Marszałkowska 100',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'kwota_mandatu',
          type: 'money',
          label: 'Kwota mandatu (PLN)',
          required: true,
          validation: { min: 50, max: 5000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'predkosc_dozwolona',
          type: 'number',
          label: 'Prędkość dozwolona (km/h)',
          placeholder: 'np. 50',
          required: true,
          validation: { min: 20, max: 140 },
          autoFillFromOcr: 'predkosc_dozwolona',
          width: 'half',
        },
        {
          name: 'predkosc_zmierzona',
          type: 'number',
          label: 'Prędkość zmierzona (km/h)',
          placeholder: 'np. 65',
          required: true,
          validation: { min: 20, max: 300 },
          autoFillFromOcr: 'predkosc_zmierzona',
          width: 'half',
        },
        {
          name: 'urzadzenie_pomiarowe',
          type: 'select',
          label: 'Urządzenie pomiarowe',
          required: false,
          options: [
            { value: 'fotoradar', label: 'Fotoradar (stacjonarny)' },
            { value: 'odcinek', label: 'Odcinkowy pomiar prędkości' },
            { value: 'lidar', label: 'Laserowy miernik (LIDAR)' },
            { value: 'iskra', label: 'Iskra-1 (radar)' },
            { value: 'rapid', label: 'Rapid 2KA (radar)' },
            { value: 'inne', label: 'Inne / nie wiem' },
          ],
          autoFillFromOcr: 'urzadzenie',
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'Wybierz powód — AI podpowie najsilniejsze argumenty na podstawie danych.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód sprzeciwu',
          required: true,
          options: [
            {
              value: 'blad_pomiaru',
              label: 'Błąd pomiaru prędkości',
              aiSuggested: true,
              hint: 'AI sugeruje — najczęstszy skuteczny powód przy fotoradarach.',
            },
            {
              value: 'brak_swiadectwa',
              label: 'Brak ważnego świadectwa wzorcowania urządzenia',
              aiSuggested: true,
              hint: 'AI sugeruje — wymagane przez prawo metrologiczne.',
            },
            {
              value: 'nie_kierowal',
              label: 'Nie ja kierowałem pojazdem',
            },
            {
              value: 'znak_niewidoczny',
              label: 'Znak ograniczenia był niewidoczny / nieprawidłowo postawiony',
            },
            {
              value: 'stan_wyzszej_koniecznosci',
              label: 'Stan wyższej konieczności',
            },
            {
              value: 'przedawnienie',
              label: 'Przedawnienie wykroczenia',
            },
            {
              value: 'inne',
              label: 'Inne (opiszę poniżej)',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Opisz dokładnie co się stało — im więcej szczegółów, tym lepsza skuteczność AI.',
          required: true,
          conditionalOn: { field: 'powod_odwolania', value: 'inne' },
          validation: { minLength: 50, maxLength: 2000 },
          helpText: 'Min. 50 znaków, max 2000.',
        },
        {
          name: 'opis_dodatkowy',
          type: 'textarea',
          label: 'Dodatkowe informacje (opcjonalnie)',
          placeholder: 'Świadkowie, dokumenty, kontekst…',
          required: false,
          conditionalOn: { field: 'powod_odwolania', value: ['blad_pomiaru', 'brak_swiadectwa', 'nie_kierowal', 'znak_niewidoczny', 'stan_wyzszej_koniecznosci', 'przedawnienie'] },
          validation: { maxLength: 1500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Mam dowody na poparcie sprzeciwu (zdjęcia, świadkowie, dokumenty)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// M4 — Odwołanie od mandatu straży miejskiej / gminnej
// ============================================================================

const M4_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu',
      description: 'Mandat ze straży miejskiej lub gminnej (radary, fotoradary lokalne).',
      fields: [
        {
          name: 'nazwa_strazy',
          type: 'text',
          label: 'Nazwa straży',
          placeholder: 'np. Straż Miejska m.st. Warszawy',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_mandatu',
          type: 'text',
          label: 'Numer mandatu / wezwania',
          placeholder: 'np. SM/12345/2024',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data zdarzenia',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce zdarzenia',
          placeholder: 'np. Warszawa, ul. Puławska 12',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'kwota_mandatu',
          type: 'money',
          label: 'Kwota mandatu (PLN)',
          required: true,
          validation: { min: 50, max: 5000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'rodzaj_wykroczenia',
          type: 'select',
          label: 'Rodzaj wykroczenia',
          required: true,
          options: [
            { value: 'predkosc', label: 'Przekroczenie prędkości' },
            { value: 'parkowanie', label: 'Parkowanie / zatrzymywanie' },
            { value: 'znak', label: 'Niezastosowanie się do znaku' },
            { value: 'pasy', label: 'Brak zapiętych pasów' },
            { value: 'inne', label: 'Inne' },
          ],
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'Straż miejska ma ograniczone uprawnienia — AI wykorzystuje to w pismach.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód sprzeciwu',
          required: true,
          options: [
            {
              value: 'brak_uprawnien',
              label: 'Straż miejska nie ma uprawnień do tego wykroczenia',
              aiSuggested: true,
              hint: 'AI sugeruje — częsty błąd kompetencyjny straży.',
            },
            {
              value: 'brak_legitymacji',
              label: 'Strażnik nie wylegitymował się przed wystawieniem mandatu',
              aiSuggested: true,
            },
            {
              value: 'blad_pomiaru',
              label: 'Błąd pomiaru / brak świadectwa wzorcowania',
              aiSuggested: true,
            },
            {
              value: 'nie_kierowal',
              label: 'Nie ja kierowałem pojazdem',
            },
            {
              value: 'brak_zdjecia',
              label: 'Brak zdjęcia / dokumentacji wykroczenia',
            },
            {
              value: 'inne',
              label: 'Inne (opiszę poniżej)',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Opisz dokładnie co się stało.',
          required: true,
          conditionalOn: { field: 'powod_odwolania', value: 'inne' },
          validation: { minLength: 50, maxLength: 2000 },
        },
        {
          name: 'opis_dodatkowy',
          type: 'textarea',
          label: 'Dodatkowe informacje (opcjonalnie)',
          placeholder: 'Szczegóły kontekstu, świadkowie…',
          required: false,
          conditionalOn: {
            field: 'powod_odwolania',
            value: ['brak_uprawnien', 'brak_legitymacji', 'blad_pomiaru', 'nie_kierowal', 'brak_zdjecia'],
          },
          validation: { maxLength: 1500 },
        },
        {
          name: 'czy_otrzymal_zdjecie',
          type: 'checkbox',
          label: 'Otrzymałem dokumentację fotograficzną wraz z mandatem',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// P1 — Reklamacja opłaty dodatkowej Strefa Płatnego Parkowania (SPP)
// ============================================================================

const P1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania SPP',
      description: 'Strefa Płatnego Parkowania — ZDM, MZD, MZK lub inny zarządca.',
      fields: [
        {
          name: 'zarzadca_strefy',
          type: 'text',
          label: 'Nazwa zarządcy strefy',
          placeholder: 'np. ZDM Warszawa, MZD Kraków',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_wezwania',
          type: 'text',
          label: 'Numer wezwania / zawiadomienia',
          placeholder: 'np. SPP/2024/12345',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data zdarzenia',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce postoju',
          placeholder: 'np. Warszawa, ul. Krucza 16',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny pojazdu',
          placeholder: 'np. WA 12345',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
        },
        {
          name: 'kwota_oplaty',
          type: 'money',
          label: 'Kwota opłaty dodatkowej (PLN)',
          required: true,
          validation: { min: 10, max: 1000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'godzina_zdarzenia',
          type: 'text',
          label: 'Godzina kontroli (opcjonalnie)',
          placeholder: 'np. 14:30',
          required: false,
          autoFillFromOcr: 'godzina',
          width: 'half',
        },
      ],
    },
    {
      title: 'Powód reklamacji',
      description: 'AI wybiera najmocniejszy argument na podstawie statystyk skuteczności.',
      fields: [
        {
          name: 'powod_reklamacji',
          type: 'radio',
          label: 'Główny powód reklamacji',
          required: true,
          options: [
            {
              value: 'oplacono_bilet',
              label: 'Opłacono parkowanie (bilet, aplikacja, abonament)',
              aiSuggested: true,
              hint: 'AI sugeruje — załącz dowód płatności.',
            },
            {
              value: 'wadliwy_parkomat',
              label: 'Parkomat był uszkodzony / nieczynny',
              aiSuggested: true,
            },
            {
              value: 'brak_oznakowania',
              label: 'Brak / nieprawidłowe oznakowanie strefy',
              aiSuggested: true,
            },
            {
              value: 'inwalida',
              label: 'Pojazd osoby z niepełnosprawnością (karta parkingowa)',
            },
            {
              value: 'pojazd_uprzywilejowany',
              label: 'Pojazd uprzywilejowany / służbowy',
            },
            {
              value: 'sila_wyzsza',
              label: 'Siła wyższa (awaria, wypadek, pomoc medyczna)',
            },
            {
              value: 'inne',
              label: 'Inne (opiszę poniżej)',
            },
          ],
        },
        {
          name: 'numer_biletu',
          type: 'text',
          label: 'Numer biletu / transakcji w aplikacji',
          placeholder: 'np. moBILET #ABC123',
          required: false,
          conditionalOn: { field: 'powod_reklamacji', value: 'oplacono_bilet' },
        },
        {
          name: 'godzina_oplacenia',
          type: 'text',
          label: 'Godzina opłacenia (od–do)',
          placeholder: 'np. 14:00–15:00',
          required: false,
          conditionalOn: { field: 'powod_reklamacji', value: 'oplacono_bilet' },
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Opisz dokładnie sytuację.',
          required: true,
          conditionalOn: {
            field: 'powod_reklamacji',
            value: ['wadliwy_parkomat', 'brak_oznakowania', 'sila_wyzsza', 'inne'],
          },
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'numer_karty_parkingowej',
          type: 'text',
          label: 'Numer karty parkingowej',
          placeholder: 'np. KP/2023/12345',
          required: true,
          conditionalOn: { field: 'powod_reklamacji', value: 'inwalida' },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Mam dowody na poparcie reklamacji (paragon, zdjęcia, screen z apki)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// P3 — Odwołanie od opłaty dodatkowej za jazdę bez biletu (ZTM/MPK/komunikacja)
// ============================================================================

const P3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania',
      description: 'Wezwanie do zapłaty od kontrolera ZTM/MPK/MPiK/komunikacji miejskiej.',
      fields: [
        {
          name: 'przewoznik',
          type: 'text',
          label: 'Przewoźnik / organizator',
          placeholder: 'np. ZTM Warszawa, MPK Kraków, ZTP Poznań',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_wezwania',
          type: 'text',
          label: 'Numer wezwania',
          placeholder: 'np. ZTM/2024/12345',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data kontroli',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'linia_pojazd',
          type: 'text',
          label: 'Linia / pojazd (opcjonalnie)',
          placeholder: 'np. tramwaj linii 17',
          required: false,
          autoFillFromOcr: 'linia',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce kontroli',
          placeholder: 'np. przystanek Centrum',
          required: false,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'kwota_oplaty',
          type: 'money',
          label: 'Kwota opłaty dodatkowej (PLN)',
          required: true,
          validation: { min: 50, max: 1000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'numer_kontrolera',
          type: 'text',
          label: 'Numer identyfikatora kontrolera',
          placeholder: 'np. K/1234',
          required: false,
          autoFillFromOcr: 'numer_kontrolera',
          width: 'half',
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'AI dobiera argumenty — od podważania dowodów po naruszenia procedury kontroli.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód odwołania',
          required: true,
          options: [
            {
              value: 'mial_bilet',
              label: 'Miałem ważny bilet / abonament / kartę miejską',
              aiSuggested: true,
              hint: 'AI sugeruje — załącz screen z apki lub kopię biletu.',
            },
            {
              value: 'kontroler_brak_legitymacji',
              label: 'Kontroler nie wylegitymował się prawidłowo',
              aiSuggested: true,
            },
            {
              value: 'awaria_kasownika',
              label: 'Kasownik / czytnik nie działał',
              aiSuggested: true,
            },
            {
              value: 'awaria_apki',
              label: 'Awaria aplikacji do biletów (mobilet, SkyCash, jakdojade)',
            },
            {
              value: 'ulga',
              label: 'Przysługuje mi ulga / przejazd bezpłatny',
            },
            {
              value: 'blad_proceduralny',
              label: 'Naruszenie procedury kontroli (np. brak protokołu)',
            },
            {
              value: 'inne',
              label: 'Inne (opiszę poniżej)',
            },
          ],
        },
        {
          name: 'numer_biletu',
          type: 'text',
          label: 'Numer biletu / transakcji',
          placeholder: 'np. mobilet #XYZ456',
          required: true,
          conditionalOn: { field: 'powod_odwolania', value: 'mial_bilet' },
        },
        {
          name: 'rodzaj_ulgi',
          type: 'select',
          label: 'Rodzaj ulgi',
          required: true,
          conditionalOn: { field: 'powod_odwolania', value: 'ulga' },
          options: [
            { value: 'student', label: 'Legitymacja studencka (ulga 50%)' },
            { value: 'uczen', label: 'Legitymacja szkolna' },
            { value: 'emeryt', label: 'Emeryt / rencista' },
            { value: 'niepelnosprawny', label: 'Osoba z niepełnosprawnością' },
            { value: 'kombatant', label: 'Kombatant' },
            { value: 'inne', label: 'Inna ulga' },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Opisz dokładnie sytuację — moment kontroli, zachowanie kontrolera, dowody.',
          required: true,
          conditionalOn: {
            field: 'powod_odwolania',
            value: ['kontroler_brak_legitymacji', 'awaria_kasownika', 'awaria_apki', 'blad_proceduralny', 'inne'],
          },
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'opis_dodatkowy',
          type: 'textarea',
          label: 'Dodatkowe informacje (opcjonalnie)',
          placeholder: 'Świadkowie, screeny, kontekst.',
          required: false,
          conditionalOn: { field: 'powod_odwolania', value: ['mial_bilet', 'ulga'] },
          validation: { maxLength: 1500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Mam dowody (screen apki, paragon, zdjęcia kasownika)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// W1 — Odpowiedź na wezwanie do zapłaty z zarzutem przedawnienia
// ============================================================================

const W1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania',
      description: 'Wezwanie do zapłaty od firmy windykacyjnej, banku lub funduszu sekurytyzacyjnego.',
      fields: [
        {
          name: 'wierzyciel',
          type: 'text',
          label: 'Wierzyciel / firma windykacyjna',
          placeholder: 'np. KRUK S.A., Ultimo, EOS, Best',
          required: true,
          autoFillFromOcr: 'wierzyciel',
        },
        {
          name: 'pierwotny_wierzyciel',
          type: 'text',
          label: 'Pierwotny wierzyciel (jeśli inny)',
          placeholder: 'np. PLAY, T-Mobile, Bank Pekao',
          required: false,
          autoFillFromOcr: 'pierwotny_wierzyciel',
        },
        {
          name: 'numer_sprawy',
          type: 'text',
          label: 'Numer sprawy / wezwania',
          placeholder: 'np. KRK/2024/123456',
          required: true,
          autoFillFromOcr: 'numer_sprawy',
          width: 'half',
        },
        {
          name: 'data_wezwania',
          type: 'date',
          label: 'Data wezwania',
          required: true,
          autoFillFromOcr: 'data_wezwania',
          width: 'half',
        },
        {
          name: 'kwota_zadania',
          type: 'money',
          label: 'Kwota żądania (PLN)',
          required: true,
          validation: { min: 1, max: 1_000_000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'rodzaj_zobowiazania',
          type: 'select',
          label: 'Rodzaj zobowiązania',
          required: true,
          options: [
            { value: 'telekom', label: 'Telekomunikacyjne (telefon/internet/TV)' },
            { value: 'kredyt_konsum', label: 'Kredyt konsumencki / pożyczka' },
            { value: 'karta_kredytowa', label: 'Karta kredytowa' },
            { value: 'rachunek', label: 'Rachunek (prąd, gaz, woda, czynsz)' },
            { value: 'sklep_raty', label: 'Zakupy na raty / RTV/AGD' },
            { value: 'mandat', label: 'Mandat / opłata komunikacyjna' },
            { value: 'najem', label: 'Najem / dzierżawa' },
            { value: 'inne', label: 'Inne' },
          ],
          autoFillFromOcr: 'rodzaj_zobowiazania',
        },
      ],
    },
    {
      title: 'Daty kluczowe dla przedawnienia',
      description: 'AI policzy termin przedawnienia (3 lub 6 lat — art. 118 KC) i dobierze argumenty.',
      fields: [
        {
          name: 'data_wymagalnosci',
          type: 'date',
          label: 'Data wymagalności roszczenia',
          required: true,
          helpText: 'Kiedy płatność stała się wymagalna — np. termin płatności faktury.',
          autoFillFromOcr: 'data_wymagalnosci',
          width: 'half',
        },
        {
          name: 'data_ostatniej_platnosci',
          type: 'date',
          label: 'Data ostatniej płatności (opcjonalnie)',
          required: false,
          helpText: 'Jeśli kiedykolwiek dokonano częściowej spłaty.',
          width: 'half',
        },
        {
          name: 'czy_uznano_dlug',
          type: 'radio',
          label: 'Czy w ostatnich latach uznano dług?',
          required: true,
          helpText: 'Uznanie długu (pisemne, ustne, częściowa płatność) przerywa bieg przedawnienia.',
          options: [
            { value: 'nie', label: 'Nie, nigdy nie uznałem długu' },
            { value: 'tak_dawno', label: 'Tak, ale ponad 3 lata temu' },
            { value: 'tak_niedawno', label: 'Tak, mniej niż 3 lata temu' },
            { value: 'nie_pamietam', label: 'Nie pamiętam' },
          ],
        },
        {
          name: 'czy_byl_pozew',
          type: 'radio',
          label: 'Czy w sprawie był pozew sądowy / nakaz zapłaty?',
          required: true,
          helpText: 'Pozew przerywa bieg przedawnienia.',
          options: [
            { value: 'nie', label: 'Nie' },
            { value: 'tak_oddalony', label: 'Tak, ale został oddalony / uchylony' },
            { value: 'tak_aktywny', label: 'Tak, sprawa jest w toku' },
            { value: 'nie_wiem', label: 'Nie wiem' },
          ],
        },
        {
          name: 'kwestionuje_dlug',
          type: 'checklist',
          label: 'Dodatkowe zarzuty (opcjonalnie)',
          required: false,
          options: [
            {
              value: 'nie_zaciagal',
              label: 'Nie zaciągałem tego zobowiązania',
              aiSuggested: true,
              hint: 'AI doda zarzut nieistnienia roszczenia.',
            },
            {
              value: 'zaplacono',
              label: 'Dług został spłacony',
              aiSuggested: true,
            },
            {
              value: 'cesja_wadliwa',
              label: 'Brak dowodu cesji wierzytelności',
              aiSuggested: true,
              hint: 'AI sugeruje — częsta luka u windykatorów.',
            },
            {
              value: 'kwota_zawyzona',
              label: 'Kwota jest zawyżona (odsetki, koszty)',
            },
            {
              value: 'naruszenie_rodo',
              label: 'Naruszenie RODO przez windykatora',
            },
          ],
        },
        {
          name: 'opis_dodatkowy',
          type: 'textarea',
          label: 'Dodatkowe okoliczności (opcjonalnie)',
          placeholder: 'Cokolwiek istotnego — historia kontaktów, nękanie, próby ugody…',
          required: false,
          validation: { maxLength: 2000 },
        },
      ],
    },
  ],
}

// ============================================================================
// EXPORT — mapa typ → schema
// ============================================================================

/**
 * UWAGA: `Record<CaseType, FormSchema>` byłby zbyt restrykcyjny — mamy
 * 29 typów, a w MVP definiujemy tylko 5. Używamy `Partial<Record<...>>`
 * i `loadFormSchema()` zwraca `null` dla brakujących typów.
 *
 * Mapowanie używa nowego enum (M4_mandat_straz_gminna zamiast M4_mandat_pasy itd.) —
 * semantyka tych 5 schemat MVP nie zmieniła się: M1 (prędkość), M4 (straż),
 * P1 (SPP), P3 (ZTM), W1 (przedawnienie).
 */
export const FORM_SCHEMAS: Partial<Record<CaseType, FormSchema>> = {
  M1_mandat_predkosc: M1_SCHEMA,
  M4_mandat_straz_gminna: M4_SCHEMA,
  P1_parking_spp: P1_SCHEMA,
  P3_parking_ztm: P3_SCHEMA,
  W1_windykacja_przedawnienie: W1_SCHEMA,
}

/** Helper: czy istnieje schema dla danego typu (= czy MVP). */
export function hasFormSchema(type: CaseType): boolean {
  return type in FORM_SCHEMAS
}
