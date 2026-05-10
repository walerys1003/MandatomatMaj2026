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
          placeholder:
            'Opisz dokładnie co się stało — im więcej szczegółów, tym lepsza skuteczność AI.',
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
          conditionalOn: {
            field: 'powod_odwolania',
            value: [
              'blad_pomiaru',
              'brak_swiadectwa',
              'nie_kierowal',
              'znak_niewidoczny',
              'stan_wyzszej_koniecznosci',
              'przedawnienie',
            ],
          },
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
            value: [
              'brak_uprawnien',
              'brak_legitymacji',
              'blad_pomiaru',
              'nie_kierowal',
              'brak_zdjecia',
            ],
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
            value: [
              'kontroler_brak_legitymacji',
              'awaria_kasownika',
              'awaria_apki',
              'blad_proceduralny',
              'inne',
            ],
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
      description:
        'Wezwanie do zapłaty od firmy windykacyjnej, banku lub funduszu sekurytyzacyjnego.',
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
      description:
        'AI policzy termin przedawnienia (3 lub 6 lat — art. 118 KC) i dobierze argumenty.',
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
          helpText:
            'Uznanie długu (pisemne, ustne, częściowa płatność) przerywa bieg przedawnienia.',
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
// M2 — Odmowa przyjęcia mandatu (przygotowanie protokołu na wszelki wypadek)
// ============================================================================

const M2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Sytuacja kontroli',
      description: 'Pismo „na wszelki wypadek" — gotowe przed lub zaraz po interwencji.',
      fields: [
        {
          name: 'organ',
          type: 'select',
          label: 'Organ kontrolujący',
          required: true,
          options: [
            { value: 'policja', label: 'Policja' },
            { value: 'straz_miejska', label: 'Straż miejska / gminna' },
            { value: 'itd', label: 'Inspekcja Transportu Drogowego (ITD)' },
            { value: 'inny', label: 'Inny organ' },
          ],
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data kontroli (lub planowanej kontroli)',
          required: true,
          width: 'half',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce kontroli',
          placeholder: 'np. Warszawa, ul. Marszałkowska',
          required: true,
          width: 'half',
        },
        {
          name: 'rodzaj_wykroczenia',
          type: 'text',
          label: 'Zarzucane wykroczenie',
          placeholder: 'np. przekroczenie prędkości o 20 km/h',
          required: true,
        },
        {
          name: 'kwota_mandatu',
          type: 'money',
          label: 'Proponowana kwota mandatu (PLN)',
          required: false,
          validation: { min: 0, max: 5000 },
          width: 'half',
        },
        {
          name: 'punkty_karne',
          type: 'number',
          label: 'Proponowane punkty karne',
          required: false,
          validation: { min: 0, max: 15 },
          width: 'half',
        },
      ],
    },
    {
      title: 'Powód odmowy',
      description: 'Podstawa odmowy przyjęcia mandatu — AI dobierze argumenty.',
      fields: [
        {
          name: 'powod_odmowy',
          type: 'radio',
          label: 'Główny powód odmowy',
          required: true,
          options: [
            {
              value: 'kwestionuje_zdarzenie',
              label: 'Kwestionuję, że wykroczenie miało miejsce',
              aiSuggested: true,
              hint: 'AI sugeruje — najczęstszy skuteczny powód odmowy.',
            },
            {
              value: 'wadliwy_pomiar',
              label: 'Wątpliwości co do prawidłowości pomiaru / dowodów',
              aiSuggested: true,
            },
            {
              value: 'nie_kierowal',
              label: 'Nie ja kierowałem pojazdem',
            },
            {
              value: 'okolicznosci_wylaczajace',
              label: 'Okoliczności wyłączające winę / stan wyższej konieczności',
            },
            {
              value: 'inne',
              label: 'Inne (opiszę poniżej)',
            },
          ],
        },
        {
          name: 'co_powiedzial_funkcjonariusz',
          type: 'textarea',
          label: 'Co powiedział funkcjonariusz przy próbie ukarania (opcjonalnie)',
          placeholder: 'Cytat / streszczenie rozmowy.',
          required: false,
          validation: { maxLength: 1000 },
        },
        {
          name: 'czy_spisano_protokol',
          type: 'radio',
          label: 'Czy spisano protokół przesłuchania?',
          required: true,
          options: [
            { value: 'tak', label: 'Tak, spisano' },
            { value: 'nie', label: 'Nie spisano' },
            { value: 'odmowil_podpisu', label: 'Odmówiłem podpisu' },
            { value: 'jeszcze_nie', label: 'Jeszcze nie — pismo na wszelki wypadek' },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Dokładny przebieg kontroli / planowanego zdarzenia.',
          required: true,
          validation: { minLength: 30, maxLength: 2000 },
        },
      ],
    },
  ],
}

// ============================================================================
// M3 — Wniosek o uchylenie prawomocnego mandatu (sąd rejonowy)
// ============================================================================

const M3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane prawomocnego mandatu',
      description: 'Mandat już prawomocny — wniosek do sądu rejonowego o uchylenie.',
      fields: [
        {
          name: 'sygnatura_mandatu',
          type: 'text',
          label: 'Sygnatura / numer mandatu',
          placeholder: 'np. MK 1234567',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_uprawomocnienia',
          type: 'date',
          label: 'Data uprawomocnienia',
          required: true,
          width: 'half',
          helpText: 'Zwykle 7 dni od doręczenia, jeśli nie wniesiono sprzeciwu.',
        },
        {
          name: 'organ_wystawiajacy',
          type: 'text',
          label: 'Organ wystawiający',
          placeholder: 'np. KP w Warszawie',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data wykroczenia',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce wykroczenia',
          placeholder: 'np. Warszawa, ul. Targowa',
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
          name: 'sad_rejonowy',
          type: 'text',
          label: 'Sąd Rejonowy właściwy',
          placeholder: 'np. Sąd Rejonowy dla Warszawy-Śródmieścia',
          required: true,
          helpText: 'Sąd właściwy wg miejsca popełnienia wykroczenia.',
        },
      ],
    },
    {
      title: 'Podstawy uchylenia',
      description: 'Art. 101 § 1 KPW — wymagane są szczególne podstawy.',
      fields: [
        {
          name: 'podstawa_uchylenia',
          type: 'radio',
          label: 'Podstawa uchylenia',
          required: true,
          options: [
            {
              value: 'nowe_dowody',
              label: 'Ujawniły się nowe dowody / okoliczności',
              aiSuggested: true,
              hint: 'AI sugeruje — najmocniejsza podstawa do uchylenia.',
            },
            {
              value: 'oczywiste_naruszenie',
              label: 'Oczywiste naruszenie prawa (błąd interpretacji)',
              aiSuggested: true,
            },
            {
              value: 'wadliwosc_prawomocnosci',
              label: 'Wadliwość uprawomocnienia (np. niedoręczenie pouczenia)',
              aiSuggested: true,
            },
            {
              value: 'brak_winy',
              label: 'Brak winy sprawcy',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_nowych_dowodow',
          type: 'textarea',
          label: 'Opis nowych dowodów / okoliczności',
          placeholder: 'Co i kiedy się ujawniło; dlaczego nie było wcześniej znane.',
          required: true,
          conditionalOn: { field: 'podstawa_uchylenia', value: 'nowe_dowody' },
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'opis_naruszenia',
          type: 'textarea',
          label: 'Opis naruszenia prawa / wadliwości',
          placeholder: 'Konkretnie wskaż przepis i sposób naruszenia.',
          required: true,
          conditionalOn: {
            field: 'podstawa_uchylenia',
            value: ['oczywiste_naruszenie', 'wadliwosc_prawomocnosci', 'brak_winy', 'inne'],
          },
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dokumenty / dowody potwierdzające podstawę uchylenia',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// M5 — Odwołanie od mandatu Straży Miejskiej (fotoradar / strefa)
// ============================================================================

const M5_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu Straży Miejskiej',
      description: 'Wariant fotoradarowy / strefowy — straż często przekracza kompetencje.',
      fields: [
        {
          name: 'nazwa_strazy',
          type: 'text',
          label: 'Nazwa straży miejskiej / gminnej',
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
          placeholder: 'np. Warszawa, ul. Puławska',
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
          name: 'urzadzenie_pomiarowe',
          type: 'select',
          label: 'Urządzenie pomiarowe',
          required: false,
          options: [
            { value: 'fotoradar_sm', label: 'Fotoradar straży miejskiej' },
            { value: 'odcinek_sm', label: 'Odcinkowy pomiar prędkości' },
            { value: 'wizja_strefa', label: 'Wizja w strefie ruchu / strefie zamieszkania' },
            { value: 'inne', label: 'Inne / nie wiem' },
          ],
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'Straż miejska ma ograniczone kompetencje — AI mocno wykorzystuje ten kąt.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód sprzeciwu',
          required: true,
          options: [
            {
              value: 'brak_uprawnien_predkosc',
              label: 'Straż miejska nie ma kompetencji do kontroli prędkości',
              aiSuggested: true,
              hint: 'AI sugeruje — kluczowy zarzut przy fotoradarach SM.',
            },
            {
              value: 'wadliwe_oznakowanie_strefy',
              label: 'Nieprawidłowe oznakowanie strefy ruchu / SPP',
              aiSuggested: true,
            },
            {
              value: 'brak_swiadectwa',
              label: 'Brak ważnego świadectwa wzorcowania urządzenia',
              aiSuggested: true,
            },
            {
              value: 'nie_kierowal',
              label: 'Nie ja kierowałem pojazdem',
            },
            {
              value: 'brak_zdjecia',
              label: 'Brak czytelnego zdjęcia / dokumentacji',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Konkretne argumenty na poparcie powodu odwołania.',
          required: true,
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'czy_otrzymal_zdjecie',
          type: 'checkbox',
          label: 'Otrzymałem dokumentację fotograficzną wraz z wezwaniem',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// M6 — Odwołanie od mandatu Inspekcji Transportu Drogowego (ITD/WITD)
// ============================================================================

const M6_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu ITD',
      description: 'Specyfika ITD — kontrola transportu, czas pracy, tachograf, waga, gabaryty.',
      fields: [
        {
          name: 'organ_itd',
          type: 'select',
          label: 'Organ',
          required: true,
          options: [
            { value: 'gitd', label: 'GITD — Główny Inspektorat Transportu Drogowego' },
            { value: 'witd', label: 'WITD — Wojewódzki Inspektorat Transportu Drogowego' },
          ],
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_mandatu',
          type: 'text',
          label: 'Numer mandatu / decyzji',
          placeholder: 'np. ITD/2024/12345',
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
          name: 'miejsce_zdarzenia',
          type: 'text',
          label: 'Miejsce kontroli',
          placeholder: 'np. punkt kontrolny A2 km 234',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny pojazdu',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
        },
        {
          name: 'kwota_mandatu',
          type: 'money',
          label: 'Kwota mandatu (PLN)',
          required: true,
          validation: { min: 100, max: 50000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'rodzaj_naruszenia',
          type: 'select',
          label: 'Rodzaj naruszenia',
          required: true,
          options: [
            { value: 'tachograf', label: 'Tachograf — naruszenie zapisu / brak danych' },
            { value: 'czas_pracy', label: 'Czas pracy / odpoczynku kierowcy' },
            { value: 'waga', label: 'Przekroczenie dopuszczalnej masy / nacisku osi' },
            { value: 'gabaryty', label: 'Przekroczenie dopuszczalnych gabarytów' },
            { value: 'zezwolenie', label: 'Brak zezwolenia / licencji' },
            { value: 'oznakowanie', label: 'Brak / nieprawidłowe oznakowanie pojazdu' },
            { value: 'stan_techniczny', label: 'Stan techniczny pojazdu' },
            { value: 'inne', label: 'Inne' },
          ],
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description:
        'ITD wymaga formalnych argumentów — AI dobiera podstawy z ustawy o transporcie drogowym.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód sprzeciwu',
          required: true,
          options: [
            {
              value: 'sila_wyzsza',
              label: 'Siła wyższa / okoliczności niezależne od kierowcy',
              aiSuggested: true,
              hint: 'AI sugeruje — częsty skuteczny powód przy tachografie.',
            },
            {
              value: 'wadliwy_pomiar',
              label: 'Wadliwy pomiar / brak świadectwa wzorcowania',
              aiSuggested: true,
            },
            {
              value: 'blad_proceduralny',
              label: 'Błędy proceduralne kontroli (brak protokołu, świadków)',
              aiSuggested: true,
            },
            {
              value: 'nieprawidlowa_kwalifikacja',
              label: 'Nieprawidłowa kwalifikacja prawna naruszenia',
            },
            {
              value: 'okolicznosci_lagodzace',
              label: 'Okoliczności łagodzące (sytuacja firmy, pierwsze naruszenie)',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Konkretne dowody, daty, świadkowie.',
          required: true,
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'czy_firma',
          type: 'radio',
          label: 'Mandat dotyczy:',
          required: true,
          options: [
            { value: 'kierowca', label: 'Kierowcy (osoby fizycznej)' },
            { value: 'firma', label: 'Firmy transportowej' },
          ],
        },
      ],
    },
  ],
}

// ============================================================================
// M7 — Wniosek o odroczenie / rozłożenie mandatu na raty
// ============================================================================

const M7_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu i wnioskowane warunki',
      description: 'Wniosek o ulgę w spłacie — dla osób w trudnej sytuacji finansowej.',
      fields: [
        {
          name: 'organ',
          type: 'text',
          label: 'Organ wystawiający mandat',
          placeholder: 'np. KP Warszawa-Śródmieście',
          required: true,
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
          name: 'kwota_mandatu',
          type: 'money',
          label: 'Kwota mandatu (PLN)',
          required: true,
          validation: { min: 50, max: 5000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'rodzaj_wniosku',
          type: 'radio',
          label: 'Rodzaj wniosku',
          required: true,
          options: [
            { value: 'odroczenie', label: 'Odroczenie terminu płatności' },
            { value: 'raty', label: 'Rozłożenie na raty', aiSuggested: true },
            { value: 'umorzenie', label: 'Umorzenie (częściowe / całkowite)' },
          ],
        },
        {
          name: 'liczba_rat',
          type: 'number',
          label: 'Wnioskowana liczba rat',
          required: true,
          validation: { min: 2, max: 24 },
          conditionalOn: { field: 'rodzaj_wniosku', value: 'raty' },
          width: 'half',
        },
        {
          name: 'kwota_raty',
          type: 'money',
          label: 'Wnioskowana kwota raty (PLN)',
          required: true,
          validation: { min: 10, max: 5000 },
          conditionalOn: { field: 'rodzaj_wniosku', value: 'raty' },
          width: 'half',
        },
        {
          name: 'data_odroczenia',
          type: 'date',
          label: 'Wnioskowana nowa data płatności',
          required: true,
          conditionalOn: { field: 'rodzaj_wniosku', value: 'odroczenie' },
        },
      ],
    },
    {
      title: 'Sytuacja finansowa',
      description: 'AI uzasadni wniosek na podstawie tych danych — bez tego nie ma szans.',
      fields: [
        {
          name: 'dochod_miesieczny',
          type: 'money',
          label: 'Miesięczny dochód netto (PLN)',
          required: true,
          validation: { min: 0, max: 100000 },
          width: 'half',
        },
        {
          name: 'wydatki_miesieczne',
          type: 'money',
          label: 'Stałe wydatki miesięczne (PLN)',
          required: true,
          validation: { min: 0, max: 100000 },
          width: 'half',
          helpText: 'Czynsz, media, kredyty, alimenty, leki.',
        },
        {
          name: 'liczba_osob',
          type: 'number',
          label: 'Liczba osób na utrzymaniu',
          required: true,
          validation: { min: 0, max: 15 },
          width: 'half',
        },
        {
          name: 'sytuacja_specjalna',
          type: 'checklist',
          label: 'Okoliczności szczególne (zaznacz pasujące)',
          required: false,
          options: [
            {
              value: 'bezrobocie',
              label: 'Bezrobocie / utrata pracy',
              aiSuggested: true,
              hint: 'AI uwzględni jako mocną podstawę wniosku.',
            },
            {
              value: 'choroba',
              label: 'Poważna choroba / niezdolność do pracy',
              aiSuggested: true,
            },
            {
              value: 'rodzina_wielodzietna',
              label: 'Rodzina wielodzietna',
            },
            {
              value: 'osoba_samotna',
              label: 'Samotny rodzic',
            },
            {
              value: 'klesk_zywiolowa',
              label: 'Klęska żywiołowa / wypadek',
            },
            {
              value: 'inne_zobowiazania',
              label: 'Liczne inne zobowiązania (kredyty, alimenty)',
            },
          ],
        },
        {
          name: 'opis_sytuacji',
          type: 'textarea',
          label: 'Opis sytuacji finansowej',
          placeholder: 'Szczegóły — od kiedy trwa, jakie kroki podjąłeś, plan spłaty.',
          required: true,
          validation: { minLength: 50, maxLength: 2500 },
        },
      ],
    },
  ],
}

// ============================================================================
// P2 — Reklamacja opłaty ZDM (Zarząd Dróg Miejskich) - parking publiczny
// ============================================================================

const P2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania ZDM',
      description: 'Reklamacja od decyzji Zarządu Dróg Miejskich (parking publiczny / SPP).',
      fields: [
        {
          name: 'miasto',
          type: 'text',
          label: 'Miasto',
          placeholder: 'np. Warszawa, Kraków, Wrocław',
          required: true,
          autoFillFromOcr: 'miasto',
        },
        {
          name: 'numer_wezwania',
          type: 'text',
          label: 'Numer wezwania / decyzji',
          placeholder: 'np. ZDM/2024/12345',
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
          placeholder: 'np. ul. Marszałkowska 100',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny pojazdu',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
        },
        {
          name: 'kwota_oplaty',
          type: 'money',
          label: 'Kwota opłaty (PLN)',
          required: true,
          validation: { min: 10, max: 1000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
      ],
    },
    {
      title: 'Powód reklamacji',
      description: 'Argumenty oparte na ustawie o drogach publicznych art. 13f.',
      fields: [
        {
          name: 'powod_reklamacji',
          type: 'radio',
          label: 'Główny powód reklamacji',
          required: true,
          options: [
            {
              value: 'oplacono',
              label: 'Opłata została uiszczona (parkomat / aplikacja)',
              aiSuggested: true,
              hint: 'AI: załącz dowód płatności.',
            },
            {
              value: 'awaria_systemu',
              label: 'Awaria systemu / parkomatu',
              aiSuggested: true,
            },
            {
              value: 'blad_identyfikacji',
              label: 'Błędna identyfikacja pojazdu / numeru rejestracyjnego',
              aiSuggested: true,
            },
            {
              value: 'nieprawidlowa_strefa',
              label: 'Nieprawidłowa kwalifikacja strefy',
            },
            {
              value: 'brak_oznakowania',
              label: 'Brak / nieczytelne oznakowanie SPP',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'numer_biletu',
          type: 'text',
          label: 'Numer biletu / transakcji w aplikacji',
          placeholder: 'np. moBILET #ABC123',
          required: true,
          conditionalOn: { field: 'powod_reklamacji', value: 'oplacono' },
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Dokładne okoliczności postoju, godziny, dowody.',
          required: true,
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowody (paragon, screen aplikacji, zdjęcia)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// P4 — Zgłoszenie błędu identyfikacji pojazdu (parking)
// ============================================================================

const P4_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania',
      description: 'Pomyłka w numerze rejestracyjnym — najszybsze do anulowania.',
      fields: [
        {
          name: 'wystawca',
          type: 'text',
          label: 'Wystawca wezwania',
          placeholder: 'np. APCOA Parking, ZDM Warszawa',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_wezwania',
          type: 'text',
          label: 'Numer wezwania',
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
          name: 'numer_na_wezwaniu',
          type: 'text',
          label: 'Numer rejestracyjny NA WEZWANIU',
          placeholder: 'np. WA 12345',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
          helpText: 'Tak jak jest wpisany na wezwaniu (z błędem).',
        },
        {
          name: 'numer_rzeczywisty',
          type: 'text',
          label: 'Mój RZECZYWISTY numer rejestracyjny',
          placeholder: 'np. WA 12354',
          required: true,
          width: 'half',
          helpText: 'Twój prawidłowy numer (z dowodu rejestracyjnego).',
        },
        {
          name: 'kwota_oplaty',
          type: 'money',
          label: 'Kwota wezwania (PLN)',
          required: true,
          validation: { min: 10, max: 1000 },
          autoFillFromOcr: 'kwota',
        },
      ],
    },
    {
      title: 'Dowody',
      description: 'Pismo jest krótkie, ale dowody są kluczowe — załącz dowód rejestracyjny.',
      fields: [
        {
          name: 'rodzaj_bledu',
          type: 'radio',
          label: 'Rodzaj błędu',
          required: true,
          options: [
            {
              value: 'literowka',
              label: 'Literówka / przestawienie znaków',
              aiSuggested: true,
              hint: 'Najczęstszy typ błędu — zwykle anulowane bez problemu.',
            },
            {
              value: 'brak_znaku',
              label: 'Brak / dodatkowy znak w numerze',
              aiSuggested: true,
            },
            {
              value: 'inny_pojazd',
              label: 'Wezwanie dotyczy zupełnie innego pojazdu',
            },
            {
              value: 'inne',
              label: 'Inny rodzaj błędu',
            },
          ],
        },
        {
          name: 'opis_bledu',
          type: 'textarea',
          label: 'Opis błędu i dowodów',
          placeholder:
            'Wskaż które znaki się różnią, gdzie znajdował się rzeczywiście Twój pojazd.',
          required: true,
          validation: { minLength: 30, maxLength: 1500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowód rejestracyjny / kopię (do załączenia do pisma)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// W2 — Odpowiedź na wezwanie do zapłaty od firmy windykacyjnej
// ============================================================================

const W2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wezwania windykacyjnego',
      description: 'Odpowiedź na wezwanie od KRUK, Ultimo, EOS, Best i innych.',
      fields: [
        {
          name: 'wierzyciel',
          type: 'text',
          label: 'Firma windykacyjna',
          placeholder: 'np. KRUK S.A., Ultimo, EOS, Best',
          required: true,
          autoFillFromOcr: 'wierzyciel',
        },
        {
          name: 'pierwotny_wierzyciel',
          type: 'text',
          label: 'Pierwotny wierzyciel (jeśli znany)',
          placeholder: 'np. PLAY, T-Mobile, Bank Pekao',
          required: false,
          autoFillFromOcr: 'pierwotny_wierzyciel',
        },
        {
          name: 'numer_sprawy',
          type: 'text',
          label: 'Numer sprawy / wezwania',
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
            { value: 'inne', label: 'Inne / nieznane' },
          ],
        },
      ],
    },
    {
      title: 'Stanowisko i zarzuty',
      description: 'AI dobiera odpowiedź — odmowa zapłaty + zarzuty proceduralne.',
      fields: [
        {
          name: 'stanowisko',
          type: 'radio',
          label: 'Twoje stanowisko',
          required: true,
          options: [
            {
              value: 'nie_uznaje',
              label: 'Nie uznaję roszczenia w całości',
              aiSuggested: true,
              hint: 'AI rekomenduje — domyślne i najsilniejsze stanowisko.',
            },
            { value: 'uznaje_czesciowo', label: 'Uznaję częściowo (kwestionuję wysokość)' },
            { value: 'przedawnione', label: 'Roszczenie jest przedawnione' },
            { value: 'sporne', label: 'Roszczenie jest sporne (nieudowodnione)' },
          ],
        },
        {
          name: 'zarzuty',
          type: 'checklist',
          label: 'Zarzuty (wybierz pasujące — AI dobierze argumenty)',
          required: true,
          options: [
            {
              value: 'przedawnienie',
              label: 'Przedawnienie roszczenia (3 / 6 lat)',
              aiSuggested: true,
              hint: 'AI: KC art. 117-125, najczęściej skuteczne przy długach z lat 2018-2020.',
            },
            {
              value: 'brak_umowy',
              label: 'Brak udowodnienia istnienia umowy z pierwotnym wierzycielem',
              aiSuggested: true,
            },
            {
              value: 'brak_cesji',
              label: 'Brak udowodnienia cesji wierzytelności',
              aiSuggested: true,
              hint: 'AI: KC art. 509-518, częsta luka u windykatorów.',
            },
            {
              value: 'splacono',
              label: 'Roszczenie zostało już spłacone',
            },
            {
              value: 'nie_zaciagal',
              label: 'Nigdy nie zaciągnąłem tego zobowiązania',
            },
            {
              value: 'kwota_zawyzona',
              label: 'Kwota jest zawyżona (odsetki, koszty windykacji)',
            },
            {
              value: 'naruszenie_rodo',
              label: 'Naruszenie RODO przez windykatora',
            },
          ],
        },
        {
          name: 'data_powstania',
          type: 'date',
          label: 'Przybliżona data powstania zobowiązania (jeśli pamiętasz)',
          required: false,
          width: 'half',
          helpText: 'Pomaga AI ocenić przedawnienie.',
        },
        {
          name: 'data_ostatniej_platnosci',
          type: 'date',
          label: 'Data ostatniej płatności (jeśli była)',
          required: false,
          width: 'half',
        },
        {
          name: 'opis_dodatkowy',
          type: 'textarea',
          label: 'Dodatkowe okoliczności (opcjonalnie)',
          placeholder: 'Historia kontaktów, próby ugody, nękanie.',
          required: false,
          validation: { maxLength: 2000 },
        },
      ],
    },
  ],
}

// ============================================================================
// W3 — Sprzeciw od nakazu zapłaty w EPU (e-Sąd Lublin)
// ============================================================================

const W3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane nakazu zapłaty EPU',
      description: 'Sąd Rejonowy Lublin-Zachód, VI Wydział Cywilny — termin 14 dni od doręczenia.',
      fields: [
        {
          name: 'sygnatura_akt',
          type: 'text',
          label: 'Sygnatura akt (np. Nc-e XXXXXXX/24)',
          placeholder: 'Nc-e 1234567/24',
          required: true,
          autoFillFromOcr: 'sygnatura_akt',
        },
        {
          name: 'data_doreczenia',
          type: 'date',
          label: 'Data doręczenia nakazu',
          required: true,
          autoFillFromOcr: 'data_doreczenia',
          width: 'half',
          helpText: 'Od tej daty liczy się 14-dniowy termin na sprzeciw.',
        },
        {
          name: 'data_nakazu',
          type: 'date',
          label: 'Data wydania nakazu',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'powod',
          type: 'text',
          label: 'Powód (firma / osoba dochodząca roszczenia)',
          placeholder: 'np. KRUK S.A., Bank XYZ',
          required: true,
          autoFillFromOcr: 'wierzyciel',
        },
        {
          name: 'pierwotny_wierzyciel',
          type: 'text',
          label: 'Pierwotny wierzyciel (jeśli inny niż powód)',
          placeholder: 'np. T-Mobile',
          required: false,
          autoFillFromOcr: 'pierwotny_wierzyciel',
        },
        {
          name: 'kwota_glowna',
          type: 'money',
          label: 'Kwota główna nakazu (PLN)',
          required: true,
          validation: { min: 1, max: 100000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
          helpText: 'EPU dotyczy roszczeń do 100 000 PLN.',
        },
        {
          name: 'kwota_odsetek',
          type: 'money',
          label: 'Kwota odsetek (PLN)',
          required: false,
          validation: { min: 0, max: 100000 },
          width: 'half',
        },
        {
          name: 'koszty_procesu',
          type: 'money',
          label: 'Koszty procesu (PLN)',
          required: false,
          validation: { min: 0, max: 50000 },
          width: 'half',
        },
        {
          name: 'rodzaj_roszczenia',
          type: 'select',
          label: 'Rodzaj roszczenia',
          required: true,
          options: [
            { value: 'telekom', label: 'Telekomunikacja' },
            { value: 'kredyt', label: 'Kredyt / pożyczka' },
            { value: 'karta_kredytowa', label: 'Karta kredytowa' },
            { value: 'rachunki', label: 'Rachunki (media, czynsz)' },
            { value: 'mandat', label: 'Mandat / opłata' },
            { value: 'najem', label: 'Najem / dzierżawa' },
            { value: 'inne', label: 'Inne' },
          ],
        },
      ],
    },
    {
      title: 'Zarzuty (checklist 7 pozycji)',
      description:
        'AI dobiera kombinację zarzutów na bazie danych z kroku 1 — sprzeciw musi je zawierać konkretnie.',
      fields: [
        {
          name: 'zarzuty',
          type: 'checklist',
          label: 'Zarzuty przeciwko nakazowi (zaznacz wszystkie pasujące)',
          required: true,
          options: [
            {
              value: 'przedawnienie',
              label: '1. Przedawnienie roszczenia (KC art. 117-125)',
              aiSuggested: true,
              hint: 'Najsilniejszy zarzut przy długach 3-6 letnich.',
            },
            {
              value: 'brak_umowy',
              label: '2. Brak udowodnienia istnienia umowy',
              aiSuggested: true,
            },
            {
              value: 'brak_cesji',
              label: '3. Wadliwa / nieudowodniona cesja wierzytelności',
              aiSuggested: true,
            },
            {
              value: 'brak_wymagalnosci',
              label: '4. Brak wymagalności roszczenia (przed terminem)',
            },
            {
              value: 'splacono',
              label: '5. Roszczenie zostało już spłacone',
            },
            {
              value: 'kwota_zawyzona',
              label: '6. Kwestionowanie wysokości (kwota główna / odsetki)',
              aiSuggested: true,
            },
            {
              value: 'klauzule_abuzywne',
              label: '7. Klauzule abuzywne w umowie / nieuczciwe warunki',
            },
          ],
        },
        {
          name: 'zadanie_dowodow',
          type: 'checkbox',
          label: 'Wnoszę o zobowiązanie powoda do przedłożenia oryginalnej umowy / dowodu cesji',
          required: false,
        },
        {
          name: 'wniosek_o_oddalenie',
          type: 'checkbox',
          label: 'Wnoszę o oddalenie powództwa w całości',
          required: false,
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Uzasadnienie sprzeciwu',
          placeholder: 'AI rozwinie ten opis w pełne pismo procesowe.',
          required: true,
          validation: { minLength: 100, maxLength: 4000 },
          helpText: 'Min. 100 znaków — opisz historię sprawy, dlaczego zarzuty są zasadne.',
        },
        {
          name: 'cross_sell_dlugomat',
          type: 'checkbox',
          label: 'Chcę pełną obsługę sprawy w Długomacie (cross-sell)',
          required: false,
          helpText: 'Po wygenerowaniu pisma otrzymasz link do Długomatu.',
        },
      ],
    },
  ],
}

// ============================================================================
// W4 — Wniosek o usunięcie / aktualizację danych z KRD / BIK / BIG
// ============================================================================

const W4_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane wpisu',
      description:
        'Wniosek do biura informacji o usunięcie / aktualizację danych (RODO art. 16-17).',
      fields: [
        {
          name: 'instytucja',
          type: 'select',
          label: 'Biuro / instytucja',
          required: true,
          options: [
            { value: 'krd', label: 'KRD (Krajowy Rejestr Długów)' },
            { value: 'bik', label: 'BIK (Biuro Informacji Kredytowej)' },
            { value: 'big_infomonitor', label: 'BIG InfoMonitor' },
            { value: 'erif', label: 'ERIF BIG' },
            { value: 'krsd', label: 'KRSD' },
          ],
        },
        {
          name: 'wierzyciel_zglaszajacy',
          type: 'text',
          label: 'Wierzyciel, który zgłosił dług',
          placeholder: 'np. PLAY, KRUK S.A., bank',
          required: true,
        },
        {
          name: 'data_wpisu',
          type: 'date',
          label: 'Data wpisu (jeśli znana)',
          required: false,
          width: 'half',
        },
        {
          name: 'kwota_wpisu',
          type: 'money',
          label: 'Kwota wpisu (PLN)',
          required: false,
          validation: { min: 0, max: 1_000_000 },
          width: 'half',
        },
        {
          name: 'rodzaj_wpisu',
          type: 'select',
          label: 'Rodzaj wpisu',
          required: true,
          options: [
            { value: 'zadluzenie', label: 'Aktywne zadłużenie' },
            { value: 'opoznienie', label: 'Opóźnienie w płatności' },
            { value: 'historyczny', label: 'Wpis historyczny (po spłacie)' },
            { value: 'inne', label: 'Inny rodzaj' },
          ],
        },
        {
          name: 'numer_sprawy_zadluzenia',
          type: 'text',
          label: 'Numer sprawy / umowy (jeśli znany)',
          placeholder: 'np. nr umowy z bankiem / wezwania',
          required: false,
        },
      ],
    },
    {
      title: 'Powód żądania',
      description: 'AI dobiera podstawę z RODO art. 16 (sprostowanie) lub 17 (usunięcie).',
      fields: [
        {
          name: 'powod_zadania',
          type: 'radio',
          label: 'Powód wniosku o usunięcie / sprostowanie',
          required: true,
          options: [
            {
              value: 'splacony',
              label: 'Dług został spłacony (wpis powinien zostać usunięty)',
              aiSuggested: true,
              hint: 'Standardowa podstawa — RODO art. 17 (prawo do usunięcia).',
            },
            {
              value: 'przedawniony',
              label: 'Dług jest przedawniony',
              aiSuggested: true,
            },
            {
              value: 'nieprawdziwy',
              label: 'Wpis jest nieprawdziwy (nie zaciągałem tego długu)',
              aiSuggested: true,
            },
            {
              value: 'kwota_bledna',
              label: 'Kwota wpisu jest błędna (sprostowanie)',
            },
            {
              value: 'brak_podstawy',
              label: 'Brak podstawy do wpisu (np. spór sądowy)',
            },
            {
              value: 'data_bledna',
              label: 'Data wpisu jest błędna',
            },
          ],
        },
        {
          name: 'data_splaty',
          type: 'date',
          label: 'Data spłaty długu',
          required: true,
          conditionalOn: { field: 'powod_zadania', value: 'splacony' },
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Konkretnie opisz dowody i przebieg sprawy.',
          required: true,
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowody (potwierdzenie spłaty, korespondencja z wierzycielem)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// W5 — Skarga do Rzecznika Finansowego (windykacja / banki / pożyczki)
// ============================================================================

const W5_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Podmiot, na który składasz skargę',
      description: 'Skarga do Rzecznika Finansowego — interwencja w sporze z instytucją finansową.',
      fields: [
        {
          name: 'rodzaj_podmiotu',
          type: 'select',
          label: 'Rodzaj podmiotu',
          required: true,
          options: [
            { value: 'bank', label: 'Bank' },
            {
              value: 'firma_pozyczkowa',
              label: 'Firma pożyczkowa (Provident, Vivus, Net Credit, etc.)',
            },
            { value: 'sklep_raty', label: 'Sklep / sprzedawca ratalny' },
            { value: 'firma_windykacyjna', label: 'Firma windykacyjna' },
            { value: 'fundusz_sekurytyzacyjny', label: 'Fundusz sekurytyzacyjny' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'nazwa_podmiotu',
          type: 'text',
          label: 'Nazwa podmiotu',
          placeholder: 'np. Bank XYZ S.A., KRUK S.A.',
          required: true,
        },
        {
          name: 'numer_sprawy',
          type: 'text',
          label: 'Numer sprawy / umowy',
          required: false,
          width: 'half',
        },
        {
          name: 'kwota_sporna',
          type: 'money',
          label: 'Kwota sporna (PLN)',
          required: false,
          validation: { min: 0, max: 1_000_000 },
          width: 'half',
        },
      ],
    },
    {
      title: 'Opis problemu i dotychczasowe działania',
      description: 'Rzecznik wymaga wcześniejszej reklamacji u podmiotu — opisz co zrobiłeś.',
      fields: [
        {
          name: 'rodzaj_problemu',
          type: 'checklist',
          label: 'Rodzaj problemu',
          required: true,
          options: [
            {
              value: 'naruszenie_umowy',
              label: 'Naruszenie warunków umowy',
              aiSuggested: true,
            },
            {
              value: 'nadmierne_oprocentowanie',
              label: 'Nadmierne / niezgodne z prawem oprocentowanie',
              aiSuggested: true,
            },
            {
              value: 'klauzule_abuzywne',
              label: 'Klauzule abuzywne (nieuczciwe warunki umowne)',
              aiSuggested: true,
            },
            {
              value: 'naruszenie_rodo',
              label: 'Naruszenie RODO (np. udostępnianie danych)',
            },
            {
              value: 'nekanie',
              label: 'Nękanie / niewłaściwe metody windykacji',
              aiSuggested: true,
            },
            {
              value: 'odmowa_reklamacji',
              label: 'Odmowa rozpatrzenia reklamacji',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'czy_skladal_reklamacje',
          type: 'radio',
          label: 'Czy składałeś reklamację u podmiotu?',
          required: true,
          options: [
            { value: 'tak_negatywna', label: 'Tak — odpowiedź negatywna' },
            { value: 'tak_brak_odp', label: 'Tak — brak odpowiedzi (>30 dni)' },
            { value: 'tak_niesatysfakcjonujaca', label: 'Tak — odpowiedź niesatysfakcjonująca' },
            { value: 'nie', label: 'Nie składałem (Rzecznik najpierw skieruje do podmiotu)' },
          ],
        },
        {
          name: 'data_reklamacji',
          type: 'date',
          label: 'Data złożenia reklamacji',
          required: false,
          conditionalOn: {
            field: 'czy_skladal_reklamacje',
            value: ['tak_negatywna', 'tak_brak_odp', 'tak_niesatysfakcjonujaca'],
          },
        },
        {
          name: 'opis_problemu',
          type: 'textarea',
          label: 'Szczegółowy opis problemu',
          placeholder: 'Chronologia zdarzeń, kwoty, daty, dowody.',
          required: true,
          validation: { minLength: 100, maxLength: 4000 },
        },
        {
          name: 'oczekiwane_rozwiazanie',
          type: 'textarea',
          label: 'Oczekiwane rozwiązanie',
          placeholder: 'Czego oczekujesz od Rzecznika Finansowego?',
          required: true,
          validation: { minLength: 30, maxLength: 1500 },
        },
      ],
    },
  ],
}

// ============================================================================
// U1 — Odwołanie od decyzji ubezpieczyciela (OC/AC, niedoszacowanie szkody)
// ============================================================================

const U1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane szkody i decyzji',
      description: 'Niedoszacowanie szkody / odmowa wypłaty — najczęstszy problem przy OC/AC.',
      fields: [
        {
          name: 'ubezpieczyciel',
          type: 'text',
          label: 'Ubezpieczyciel',
          placeholder: 'np. PZU, Warta, Allianz, Generali',
          required: true,
          autoFillFromOcr: 'ubezpieczyciel',
        },
        {
          name: 'numer_polisy',
          type: 'text',
          label: 'Numer polisy',
          placeholder: 'np. OC/2024/123456',
          required: true,
          autoFillFromOcr: 'numer_polisy',
          width: 'half',
        },
        {
          name: 'numer_szkody',
          type: 'text',
          label: 'Numer szkody',
          placeholder: 'np. SZK/2024/789',
          required: true,
          autoFillFromOcr: 'numer_szkody',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data zdarzenia / szkody',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'data_decyzji',
          type: 'date',
          label: 'Data decyzji ubezpieczyciela',
          required: true,
          autoFillFromOcr: 'data_wezwania',
          width: 'half',
          helpText: 'Termin odwołania liczy się od tej daty.',
        },
        {
          name: 'rodzaj_polisy',
          type: 'select',
          label: 'Rodzaj polisy',
          required: true,
          options: [
            { value: 'oc_komunikacja', label: 'OC komunikacyjne (sprawca)' },
            { value: 'ac', label: 'AC (autocasco)' },
            { value: 'oc_zycie', label: 'OC w życiu prywatnym' },
            { value: 'majatkowa', label: 'Ubezpieczenie majątkowe (mieszkanie/dom)' },
            { value: 'osobowa', label: 'NNW / ubezpieczenie osobowe' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'rodzaj_szkody',
          type: 'select',
          label: 'Rodzaj szkody',
          required: true,
          options: [
            { value: 'komunikacyjna', label: 'Komunikacyjna (kolizja, wypadek)' },
            { value: 'majatkowa', label: 'Majątkowa (zalanie, kradzież, pożar)' },
            { value: 'osobowa', label: 'Osobowa (uszczerbek na zdrowiu)' },
            { value: 'mieszana', label: 'Mieszana' },
          ],
        },
        {
          name: 'kwota_zadana',
          type: 'money',
          label: 'Kwota wnioskowana / oszacowana (PLN)',
          required: true,
          validation: { min: 0, max: 10_000_000 },
          width: 'half',
        },
        {
          name: 'kwota_wyplacona',
          type: 'money',
          label: 'Kwota wypłacona przez ubezpieczyciela (PLN)',
          required: true,
          validation: { min: 0, max: 10_000_000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'AI argumentuje na podstawie KC art. 805-828 oraz ustawy o ubezpieczeniach.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód odwołania',
          required: true,
          options: [
            {
              value: 'zanizenie_wyceny',
              label: 'Zaniżenie wyceny szkody',
              aiSuggested: true,
              hint: 'AI: najczęstszy skuteczny zarzut. Załącz wycenę niezależną.',
            },
            {
              value: 'pominiete_pozycje',
              label: 'Pominięte pozycje w wycenie',
              aiSuggested: true,
            },
            {
              value: 'odmowa_wyplaty',
              label: 'Odmowa wypłaty w całości',
              aiSuggested: true,
            },
            {
              value: 'amortyzacja_zawyzona',
              label: 'Zawyżona amortyzacja części (przy szkodzie komunikacyjnej)',
            },
            {
              value: 'brak_kosztow_holowania',
              label: 'Brak uwzględnienia kosztów holowania / najmu pojazdu zastępczego',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'czy_ma_wycene_niezalezna',
          type: 'checkbox',
          label: 'Posiadam wycenę niezależną / kosztorys naprawy',
          required: false,
        },
        {
          name: 'kwota_wyceny_niezaleznej',
          type: 'money',
          label: 'Kwota z wyceny niezależnej (PLN)',
          required: false,
          conditionalOn: { field: 'czy_ma_wycene_niezalezna', value: true },
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności i argumentów',
          placeholder: 'Szczegóły szkody, konkretne pozycje pominięte / niedoszacowane, dowody.',
          required: true,
          validation: { minLength: 100, maxLength: 3000 },
        },
      ],
    },
  ],
}

// ============================================================================
// U2 — Wezwanie ubezpieczyciela do wypłaty pełnej kwoty (przedsądowe)
// ============================================================================

const U2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane szkody',
      description: 'Wezwanie przedsądowe — formalny ostatni krok przed pozwem.',
      fields: [
        {
          name: 'ubezpieczyciel',
          type: 'text',
          label: 'Ubezpieczyciel',
          required: true,
          autoFillFromOcr: 'ubezpieczyciel',
        },
        {
          name: 'numer_polisy',
          type: 'text',
          label: 'Numer polisy',
          required: true,
          autoFillFromOcr: 'numer_polisy',
          width: 'half',
        },
        {
          name: 'numer_szkody',
          type: 'text',
          label: 'Numer szkody',
          required: true,
          autoFillFromOcr: 'numer_szkody',
          width: 'half',
        },
        {
          name: 'data_zdarzenia',
          type: 'date',
          label: 'Data zdarzenia',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
        },
        {
          name: 'kwota_zadana',
          type: 'money',
          label: 'Kwota oczekiwana — pełna szkoda (PLN)',
          required: true,
          validation: { min: 0, max: 10_000_000 },
          width: 'half',
        },
        {
          name: 'kwota_wyplacona',
          type: 'money',
          label: 'Kwota dotychczas wypłacona (PLN)',
          required: true,
          validation: { min: 0, max: 10_000_000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'kwota_wyrownania',
          type: 'money',
          label: 'Kwota wyrównania (PLN — różnica)',
          required: true,
          validation: { min: 1, max: 10_000_000 },
          helpText: 'Kwota, której domagasz się od ubezpieczyciela.',
        },
      ],
    },
    {
      title: 'Termin i podstawa',
      description: 'Termin 14 dni — po nim przygotowanie pozwu.',
      fields: [
        {
          name: 'termin_wyplaty_dni',
          type: 'number',
          label: 'Termin wyznaczony do wypłaty (dni)',
          required: true,
          validation: { min: 7, max: 30 },
          width: 'half',
          helpText: 'Standardowo 14 dni.',
        },
        {
          name: 'czy_skladal_odwolanie',
          type: 'radio',
          label: 'Czy składano już odwołanie?',
          required: true,
          options: [
            { value: 'tak', label: 'Tak — odpowiedź negatywna' },
            { value: 'tak_brak_odp', label: 'Tak — brak odpowiedzi' },
            { value: 'nie', label: 'Nie — wezwanie po decyzji odmownej' },
          ],
        },
        {
          name: 'podstawa_zadania',
          type: 'checklist',
          label: 'Podstawy żądania',
          required: true,
          options: [
            {
              value: 'wycena_niezalezna',
              label: 'Wycena niezależna potwierdzająca pełną szkodę',
              aiSuggested: true,
            },
            {
              value: 'koszty_dodatkowe',
              label: 'Pominięte koszty (holowanie, najem, naprawa)',
              aiSuggested: true,
            },
            {
              value: 'odsetki',
              label: 'Odsetki ustawowe za opóźnienie',
              aiSuggested: true,
            },
            {
              value: 'koszty_pozwu',
              label: 'Zapowiedź pozwu — koszty obciążą ubezpieczyciela',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Argumentacja',
          placeholder: 'Konkretne dowody, wycena, odpowiedź ubezpieczyciela.',
          required: true,
          validation: { minLength: 100, maxLength: 3000 },
        },
        {
          name: 'zapowiedz_pozwu',
          type: 'checkbox',
          label: 'Zapowiedzieć pozew sądowy w przypadku odmowy',
          required: false,
          helpText: 'AI dołączy formalną zapowiedź pozwu.',
        },
      ],
    },
  ],
}

// ============================================================================
// U3 — Skarga do Rzecznika Finansowego — ubezpieczenia
// ============================================================================

const U3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane ubezpieczyciela i sprawy',
      description: 'Skarga specjalizowana pod ubezpieczenia — Rzecznik Finansowy ds. ubezpieczeń.',
      fields: [
        {
          name: 'ubezpieczyciel',
          type: 'text',
          label: 'Ubezpieczyciel',
          required: true,
          autoFillFromOcr: 'ubezpieczyciel',
        },
        {
          name: 'numer_polisy',
          type: 'text',
          label: 'Numer polisy',
          required: false,
          autoFillFromOcr: 'numer_polisy',
          width: 'half',
        },
        {
          name: 'numer_szkody',
          type: 'text',
          label: 'Numer szkody',
          required: false,
          autoFillFromOcr: 'numer_szkody',
          width: 'half',
        },
        {
          name: 'rodzaj_polisy',
          type: 'select',
          label: 'Rodzaj polisy',
          required: true,
          options: [
            { value: 'oc_komunikacja', label: 'OC komunikacyjne' },
            { value: 'ac', label: 'AC' },
            { value: 'majatkowa', label: 'Majątkowa' },
            { value: 'zycie', label: 'Życiowa' },
            { value: 'nnw', label: 'NNW' },
            { value: 'turystyczna', label: 'Turystyczna' },
            { value: 'inne', label: 'Inna' },
          ],
        },
        {
          name: 'kwota_sporna',
          type: 'money',
          label: 'Kwota sporna (PLN)',
          required: false,
          validation: { min: 0, max: 10_000_000 },
        },
      ],
    },
    {
      title: 'Opis problemu i dotychczasowe działania',
      description: 'Wymagana wcześniejsza reklamacja u ubezpieczyciela.',
      fields: [
        {
          name: 'rodzaj_problemu',
          type: 'checklist',
          label: 'Rodzaj problemu',
          required: true,
          options: [
            {
              value: 'odmowa_wyplaty',
              label: 'Odmowa wypłaty świadczenia',
              aiSuggested: true,
            },
            {
              value: 'zanizone_swiadczenie',
              label: 'Zaniżone świadczenie',
              aiSuggested: true,
            },
            {
              value: 'opieszalosc',
              label: 'Opieszałość likwidacji szkody (>30 dni)',
              aiSuggested: true,
            },
            {
              value: 'naruszenie_owu',
              label: 'Naruszenie OWU przez ubezpieczyciela',
            },
            {
              value: 'klauzule_abuzywne',
              label: 'Nieuczciwe klauzule w OWU',
            },
            {
              value: 'odmowa_reklamacji',
              label: 'Odmowa rozpatrzenia reklamacji',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'czy_skladal_reklamacje',
          type: 'radio',
          label: 'Czy składałeś reklamację u ubezpieczyciela?',
          required: true,
          options: [
            { value: 'tak_negatywna', label: 'Tak — odpowiedź negatywna' },
            { value: 'tak_brak_odp', label: 'Tak — brak odpowiedzi (>30 dni)' },
            { value: 'tak_niesatysfakcjonujaca', label: 'Tak — odpowiedź niesatysfakcjonująca' },
            { value: 'nie', label: 'Nie składałem' },
          ],
        },
        {
          name: 'data_reklamacji',
          type: 'date',
          label: 'Data złożenia reklamacji',
          required: false,
          conditionalOn: {
            field: 'czy_skladal_reklamacje',
            value: ['tak_negatywna', 'tak_brak_odp', 'tak_niesatysfakcjonujaca'],
          },
        },
        {
          name: 'opis_problemu',
          type: 'textarea',
          label: 'Szczegółowy opis sprawy',
          placeholder: 'Chronologia, kwoty, dowody, korespondencja.',
          required: true,
          validation: { minLength: 100, maxLength: 4000 },
        },
        {
          name: 'oczekiwane_rozwiazanie',
          type: 'textarea',
          label: 'Oczekiwane rozwiązanie',
          required: true,
          validation: { minLength: 30, maxLength: 1500 },
        },
      ],
    },
  ],
}

// ============================================================================
// E1 — Odwołanie od kary e-TOLL / GITD (decyzja administracyjna)
// ============================================================================

const E1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane decyzji e-TOLL',
      description:
        'Decyzja Głównego Inspektora Transportu Drogowego — termin 14 dni od doręczenia.',
      fields: [
        {
          name: 'numer_decyzji',
          type: 'text',
          label: 'Numer decyzji',
          placeholder: 'np. GITD-IK-2024/12345',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_decyzji',
          type: 'date',
          label: 'Data decyzji',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'data_doreczenia',
          type: 'date',
          label: 'Data doręczenia',
          required: true,
          width: 'half',
          helpText: 'Termin 14 dni liczy się od tej daty.',
        },
        {
          name: 'kwota_kary',
          type: 'money',
          label: 'Kwota kary (PLN)',
          required: true,
          validation: { min: 100, max: 100000 },
          autoFillFromOcr: 'kwota',
          width: 'half',
        },
        {
          name: 'odcinek_drogi',
          type: 'text',
          label: 'Odcinek drogi / autostrada',
          placeholder: 'np. A2 km 234-256',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'data_przejazdu',
          type: 'date',
          label: 'Data przejazdu',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny pojazdu',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
        },
        {
          name: 'numer_konta_etoll',
          type: 'text',
          label: 'Numer konta e-TOLL (opcjonalnie)',
          required: false,
        },
      ],
    },
    {
      title: 'Powód odwołania',
      description: 'AI argumentuje na bazie ustawy o drogach publicznych i ustawy o autostradach.',
      fields: [
        {
          name: 'powod_odwolania',
          type: 'radio',
          label: 'Główny powód odwołania',
          required: true,
          options: [
            {
              value: 'awaria_obu',
              label: 'Awaria urządzenia OBU / aplikacji e-TOLL',
              aiSuggested: true,
              hint: 'AI: częsty skuteczny zarzut przy awariach.',
            },
            {
              value: 'podwojne_naliczenie',
              label: 'Podwójne naliczenie opłaty',
              aiSuggested: true,
            },
            {
              value: 'brak_obowiazku',
              label: 'Brak obowiązku opłaty na tym odcinku',
              aiSuggested: true,
            },
            {
              value: 'droga_alternatywna',
              label: 'Przejazd po drodze alternatywnej (objazd)',
            },
            {
              value: 'oplata_wniesiona',
              label: 'Opłata została wniesiona (dowód płatności)',
            },
            {
              value: 'sila_wyzsza',
              label: 'Siła wyższa / sytuacja nadzwyczajna',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Konkretne dowody, awarii, godziny, screeny aplikacji.',
          required: true,
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowody (logi OBU, screeny aplikacji, potwierdzenia płatności)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// E2 — Reklamacja podwójnego naliczenia e-TOLL
// ============================================================================

const E2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane przejazdu i podwójnego naliczenia',
      description: 'Reklamacja do operatora systemu e-TOLL — żądanie korekty i zwrotu.',
      fields: [
        {
          name: 'numer_konta_etoll',
          type: 'text',
          label: 'Numer konta e-TOLL',
          required: true,
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny pojazdu',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
          width: 'half',
        },
        {
          name: 'data_przejazdu',
          type: 'date',
          label: 'Data przejazdu',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'odcinek_drogi',
          type: 'text',
          label: 'Odcinek drogi / autostrada',
          placeholder: 'np. A4 Katowice-Kraków',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'kwota_pierwsza',
          type: 'money',
          label: 'Kwota pierwszego naliczenia (PLN)',
          required: true,
          validation: { min: 0.01, max: 10000 },
          width: 'half',
        },
        {
          name: 'kwota_podwojnego',
          type: 'money',
          label: 'Kwota powtórnego naliczenia (PLN)',
          required: true,
          validation: { min: 0.01, max: 10000 },
          width: 'half',
        },
        {
          name: 'data_naliczenia_pierwszego',
          type: 'date',
          label: 'Data pierwszego naliczenia',
          required: true,
          width: 'half',
        },
        {
          name: 'data_naliczenia_drugiego',
          type: 'date',
          label: 'Data powtórnego naliczenia',
          required: true,
          width: 'half',
        },
      ],
    },
    {
      title: 'Dowody i opis',
      description:
        'AI przygotuje reklamację — żądanie korekty + zwrotu nienależnie pobranej kwoty.',
      fields: [
        {
          name: 'rodzaj_naliczenia',
          type: 'radio',
          label: 'Rodzaj podwójnego naliczenia',
          required: true,
          options: [
            {
              value: 'ten_sam_odcinek',
              label: 'Dwukrotne naliczenie tego samego odcinka',
              aiSuggested: true,
            },
            {
              value: 'aplikacja_obu',
              label: 'Naliczenie zarówno przez aplikację, jak i OBU',
              aiSuggested: true,
            },
            {
              value: 'rozne_systemy',
              label: 'Naliczenie w e-TOLL i poprzedni viaTOLL',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności',
          placeholder: 'Dokładne godziny przejazdu, screeny aplikacji.',
          required: true,
          validation: { minLength: 30, maxLength: 2000 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowody (logi OBU, screeny, potwierdzenia)',
          required: false,
        },
        {
          name: 'rachunek_do_zwrotu',
          type: 'text',
          label: 'Numer rachunku do zwrotu (IBAN)',
          placeholder: 'np. PL 12 1234 5678 9012 3456 7890 1234',
          required: false,
          helpText: 'Jeśli wnioskujesz o zwrot na rachunek.',
        },
      ],
    },
  ],
}

// ============================================================================
// E3 — Wniosek o anulowanie opłaty e-TOLL (force majeure / awaria)
// ============================================================================

const E3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane przejazdu',
      description: 'Wniosek o anulowanie — siła wyższa, awaria techniczna, błąd systemu.',
      fields: [
        {
          name: 'numer_decyzji',
          type: 'text',
          label: 'Numer decyzji / wezwania',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_decyzji',
          type: 'date',
          label: 'Data decyzji',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'kwota_oplaty',
          type: 'money',
          label: 'Kwota opłaty (PLN)',
          required: true,
          validation: { min: 1, max: 100000 },
          autoFillFromOcr: 'kwota',
        },
        {
          name: 'odcinek_drogi',
          type: 'text',
          label: 'Odcinek drogi',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'numer_rejestracyjny',
          type: 'text',
          label: 'Numer rejestracyjny',
          required: true,
          autoFillFromOcr: 'numer_rejestracyjny',
        },
      ],
    },
    {
      title: 'Powód anulowania',
      description: 'Wymagane szczególne okoliczności — AI pomoże uzasadnić.',
      fields: [
        {
          name: 'powod_anulowania',
          type: 'radio',
          label: 'Powód anulowania',
          required: true,
          options: [
            {
              value: 'awaria_systemu',
              label: 'Awaria systemu e-TOLL po stronie operatora',
              aiSuggested: true,
              hint: 'AI: najmocniejsza podstawa (logi awarii dostępne publicznie).',
            },
            {
              value: 'awaria_obu',
              label: 'Awaria OBU / aplikacji w pojeździe',
              aiSuggested: true,
            },
            {
              value: 'sila_wyzsza',
              label: 'Siła wyższa (klęska żywiołowa, wypadek)',
              aiSuggested: true,
            },
            {
              value: 'blad_techniczny',
              label: 'Błąd techniczny (np. zła kwalifikacja kategorii pojazdu)',
            },
            {
              value: 'objazdy',
              label: 'Wymuszone objazdy (zamknięcia drogi)',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'data_problemu',
          type: 'date',
          label: 'Data wystąpienia problemu',
          required: true,
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Szczegółowy opis okoliczności',
          placeholder: 'Co się stało, jakie kroki podjąłeś, jakie masz dowody.',
          required: true,
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dowody (logi, zgłoszenia awarii, dokumenty)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// K1 — Sprzeciw od decyzji o zatrzymaniu prawa jazdy
// ============================================================================

const K1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane decyzji o zatrzymaniu PJ',
      description: 'Sprzeciw do Samorządowego Kolegium Odwoławczego — termin 14 dni.',
      fields: [
        {
          name: 'organ_wydajacy',
          type: 'select',
          label: 'Organ wydający decyzję',
          required: true,
          options: [
            { value: 'starosta', label: 'Starosta (zatrzymanie administracyjne)' },
            { value: 'policja', label: 'Policja (zatrzymanie przy kontroli)' },
            { value: 'sad', label: 'Sąd (środek karny)' },
            { value: 'prokurator', label: 'Prokurator (postępowanie karne)' },
          ],
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_decyzji',
          type: 'text',
          label: 'Numer decyzji',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_decyzji',
          type: 'date',
          label: 'Data decyzji',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'data_doreczenia',
          type: 'date',
          label: 'Data doręczenia',
          required: true,
          helpText: 'Termin 14 dni liczy się od tej daty.',
        },
        {
          name: 'okres_zatrzymania',
          type: 'select',
          label: 'Okres zatrzymania',
          required: true,
          options: [
            { value: '3_miesiace', label: '3 miesiące' },
            { value: '6_miesiecy', label: '6 miesięcy' },
            { value: '12_miesiecy', label: '12 miesięcy' },
            { value: 'inne', label: 'Inny okres' },
          ],
        },
        {
          name: 'powod_zatrzymania',
          type: 'select',
          label: 'Powód zatrzymania (wg decyzji)',
          required: true,
          options: [
            { value: 'punkty_24', label: 'Przekroczenie 24 punktów karnych' },
            { value: 'alkohol', label: 'Jazda pod wpływem alkoholu' },
            { value: 'narkotyki', label: 'Jazda pod wpływem środków odurzających' },
            {
              value: 'predkosc_50',
              label: 'Przekroczenie prędkości o 50+ km/h w terenie zabudowanym',
            },
            { value: 'wypadek', label: 'Spowodowanie wypadku' },
            { value: 'odmowa_badania', label: 'Odmowa badania trzeźwości' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'organ_odwolawczy',
          type: 'text',
          label: 'Samorządowe Kolegium Odwoławcze',
          placeholder: 'np. SKO w Warszawie',
          required: true,
        },
      ],
    },
    {
      title: 'Argumenty obrony',
      description: 'AI dobiera argumenty — najsilniejsze przy ułaskawieniu / cofnięciu decyzji.',
      fields: [
        {
          name: 'argumenty_obrony',
          type: 'checklist',
          label: 'Argumenty obrony (wybierz pasujące)',
          required: true,
          options: [
            {
              value: 'wadliwe_pomiary',
              label: 'Wadliwe pomiary (alkomat / radar)',
              aiSuggested: true,
            },
            {
              value: 'naruszenie_proceduralne',
              label: 'Naruszenia proceduralne kontroli',
              aiSuggested: true,
            },
            {
              value: 'punkty_bledne',
              label: 'Błędne naliczanie punktów karnych',
            },
            {
              value: 'pj_potrzebne_zawodowo',
              label: 'PJ niezbędne zawodowo (utrata pracy)',
              aiSuggested: true,
              hint: 'AI: silny argument do skrócenia okresu zatrzymania.',
            },
            {
              value: 'pj_potrzebne_rodzinnie',
              label: 'PJ niezbędne rodzinnie (osoby na utrzymaniu)',
              aiSuggested: true,
            },
            {
              value: 'okolicznosci_lagodzace',
              label: 'Okoliczności łagodzące (pierwsze naruszenie, przyznanie)',
            },
            {
              value: 'blad_kwalifikacji',
              label: 'Błąd kwalifikacji prawnej naruszenia',
            },
          ],
        },
        {
          name: 'sytuacja_zawodowa',
          type: 'textarea',
          label: 'Sytuacja zawodowa',
          placeholder: 'Czy PJ jest niezbędne zawodowo? Branża, stanowisko.',
          required: false,
          conditionalOn: { field: 'argumenty_obrony', value: 'pj_potrzebne_zawodowo' },
          validation: { maxLength: 1500 },
        },
        {
          name: 'sytuacja_rodzinna',
          type: 'textarea',
          label: 'Sytuacja rodzinna',
          placeholder: 'Osoby na utrzymaniu, dojazdy do szkoły / lekarza.',
          required: false,
          conditionalOn: { field: 'argumenty_obrony', value: 'pj_potrzebne_rodzinnie' },
          validation: { maxLength: 1500 },
        },
        {
          name: 'opis_okolicznosci',
          type: 'textarea',
          label: 'Opis okoliczności sprawy',
          placeholder: 'Cała chronologia od zdarzenia do decyzji.',
          required: true,
          validation: { minLength: 100, maxLength: 4000 },
        },
      ],
    },
  ],
}

// ============================================================================
// K2 — Wniosek o cofnięcie decyzji o zatrzymaniu PJ
// ============================================================================

const K2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane sprawy',
      description: 'Wniosek o ponowne rozpatrzenie / cofnięcie decyzji — zmiana okoliczności.',
      fields: [
        {
          name: 'organ_wydajacy',
          type: 'text',
          label: 'Organ, który wydał decyzję',
          placeholder: 'np. Starosta Powiatu Warszawskiego',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_decyzji',
          type: 'text',
          label: 'Numer decyzji',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_decyzji',
          type: 'date',
          label: 'Data decyzji',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'okres_zatrzymania',
          type: 'select',
          label: 'Okres zatrzymania',
          required: true,
          options: [
            { value: '3_miesiace', label: '3 miesiące' },
            { value: '6_miesiecy', label: '6 miesięcy' },
            { value: '12_miesiecy', label: '12 miesięcy' },
            { value: 'inne', label: 'Inny okres' },
          ],
        },
      ],
    },
    {
      title: 'Zmiana okoliczności',
      description: 'Bez zmiany okoliczności wniosek nie ma szans — AI pomoże opisać podstawę.',
      fields: [
        {
          name: 'rodzaj_zmiany',
          type: 'checklist',
          label: 'Rodzaj zmiany okoliczności',
          required: true,
          options: [
            {
              value: 'utrata_pracy',
              label: 'Utrata pracy bez PJ',
              aiSuggested: true,
              hint: 'AI: udokumentuj wypowiedzenie / pismo od pracodawcy.',
            },
            {
              value: 'choroba_w_rodzinie',
              label: 'Choroba w rodzinie wymagająca dojazdów',
              aiSuggested: true,
            },
            {
              value: 'nowa_praca_kierowcza',
              label: 'Nowa oferta pracy wymagająca PJ',
            },
            {
              value: 'zmiana_orzeczenia',
              label: 'Zmiana orzeczenia w sprawie karnej (uniewinnienie, umorzenie)',
              aiSuggested: true,
            },
            {
              value: 'kurs_resocjalizacji',
              label: 'Ukończenie kursu / terapii / programu',
            },
            {
              value: 'inne',
              label: 'Inne',
            },
          ],
        },
        {
          name: 'opis_zmiany',
          type: 'textarea',
          label: 'Szczegółowy opis zmiany okoliczności',
          placeholder: 'Co się zmieniło, kiedy, jakie masz dowody.',
          required: true,
          validation: { minLength: 100, maxLength: 3000 },
        },
        {
          name: 'wnioskowane_rozwiazanie',
          type: 'radio',
          label: 'Wnioskowane rozwiązanie',
          required: true,
          options: [
            { value: 'cofniecie', label: 'Cofnięcie decyzji w całości' },
            { value: 'skrocenie', label: 'Skrócenie okresu zatrzymania', aiSuggested: true },
            { value: 'warunkowe', label: 'Warunkowe zwrócenie PJ (z ograniczeniami)' },
          ],
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dokumenty potwierdzające zmianę okoliczności',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// K3 — Wniosek o weryfikację urządzenia pomiarowego
// ============================================================================

const K3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mandatu i urządzenia',
      description:
        'Żądanie udostępnienia świadectwa wzorcowania, protokołu pomiaru, zapisu kamery (RODO art. 15).',
      fields: [
        {
          name: 'organ',
          type: 'text',
          label: 'Organ wystawiający mandat',
          placeholder: 'np. Policja, Straż Miejska, GITD',
          required: true,
          autoFillFromOcr: 'organ',
        },
        {
          name: 'numer_mandatu',
          type: 'text',
          label: 'Numer mandatu / wezwania',
          required: true,
          autoFillFromOcr: 'numer_mandatu',
          width: 'half',
        },
        {
          name: 'data_pomiaru',
          type: 'date',
          label: 'Data pomiaru',
          required: true,
          autoFillFromOcr: 'data_zdarzenia',
          width: 'half',
        },
        {
          name: 'miejsce_pomiaru',
          type: 'text',
          label: 'Miejsce pomiaru',
          required: true,
          autoFillFromOcr: 'miejsce_zdarzenia',
        },
        {
          name: 'typ_urzadzenia',
          type: 'select',
          label: 'Typ urządzenia pomiarowego',
          required: true,
          options: [
            { value: 'fotoradar_stacjonarny', label: 'Fotoradar stacjonarny' },
            { value: 'fotoradar_mobilny', label: 'Fotoradar mobilny' },
            { value: 'odcinek', label: 'Odcinkowy pomiar prędkości' },
            { value: 'lidar', label: 'Laserowy miernik prędkości (LIDAR)' },
            { value: 'radar_iskra', label: 'Radar Iskra-1' },
            { value: 'radar_rapid', label: 'Radar Rapid 2KA' },
            { value: 'wideorejestrator', label: 'Wideorejestrator' },
            { value: 'alkomat', label: 'Alkomat / urządzenie do badania trzeźwości' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'numer_seryjny',
          type: 'text',
          label: 'Numer seryjny urządzenia (jeśli znany)',
          required: false,
        },
      ],
    },
    {
      title: 'Zakres żądania',
      description: 'AI sformułuje pismo na bazie Prawa o miarach i RODO art. 15.',
      fields: [
        {
          name: 'zakres_zadania',
          type: 'checklist',
          label: 'Co wnioskujesz (wybierz wszystkie potrzebne)',
          required: true,
          options: [
            {
              value: 'swiadectwo_wzorcowania',
              label: 'Świadectwo wzorcowania / legalizacji urządzenia',
              aiSuggested: true,
              hint: 'AI: kluczowy dokument — bez niego mandat upada.',
            },
            {
              value: 'protokol_pomiaru',
              label: 'Protokół pomiaru',
              aiSuggested: true,
            },
            {
              value: 'zapis_kamery',
              label: 'Zapis kamery / nagranie',
              aiSuggested: true,
            },
            {
              value: 'instrukcja_obslugi',
              label: 'Instrukcja obsługi urządzenia',
            },
            {
              value: 'uprawnienia_funkcjonariusza',
              label: 'Dokumenty potwierdzające uprawnienia funkcjonariusza',
            },
            {
              value: 'dane_osobowe',
              label: 'Wszystkie dane osobowe przetwarzane na mój temat (RODO art. 15)',
            },
          ],
        },
        {
          name: 'cel_zadania',
          type: 'textarea',
          label: 'Cel żądania (krótko)',
          placeholder: 'np. Weryfikacja prawidłowości pomiaru przed wniesieniem sprzeciwu.',
          required: false,
          validation: { maxLength: 500 },
        },
        {
          name: 'termin_realizacji_dni',
          type: 'number',
          label: 'Wnioskowany termin realizacji (dni)',
          required: true,
          validation: { min: 7, max: 30 },
          helpText: 'RODO standardowo 30 dni — możesz prosić o krótszy.',
        },
      ],
    },
  ],
}

// ============================================================================
// K4 — Korekta wpisów w rejestrze punktów karnych
// ============================================================================

const K4_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane prawa jazdy',
      description: 'Wniosek o weryfikację i sprostowanie wpisów w ewidencji kierowców.',
      fields: [
        {
          name: 'numer_prawa_jazdy',
          type: 'text',
          label: 'Numer prawa jazdy',
          required: true,
          width: 'half',
        },
        {
          name: 'liczba_punktow_aktualna',
          type: 'number',
          label: 'Aktualna liczba punktów karnych (wg KWP)',
          required: true,
          validation: { min: 0, max: 50 },
          width: 'half',
        },
        {
          name: 'komendant_wojewodzki',
          type: 'text',
          label: 'Komendant Wojewódzki Policji',
          placeholder: 'np. KWP w Warszawie',
          required: true,
        },
      ],
    },
    {
      title: 'Kwestionowane wpisy',
      description: 'AI przygotuje formalny wniosek o weryfikację i korektę ewidencji.',
      fields: [
        {
          name: 'liczba_kwestionowanych',
          type: 'number',
          label: 'Liczba kwestionowanych wpisów',
          required: true,
          validation: { min: 1, max: 20 },
          helpText: 'Określ ile wpisów chcesz zakwestionować.',
        },
        {
          name: 'opis_wpisow',
          type: 'textarea',
          label: 'Opis kwestionowanych wpisów (data, zdarzenie, punkty)',
          placeholder: 'np. 12.03.2024 — przekroczenie prędkości 30km/h, 8 pkt. Kwestionuję bo...',
          required: true,
          validation: { minLength: 100, maxLength: 4000 },
          helpText: 'Dla każdego wpisu: data, opis zdarzenia, naliczone punkty, powód korekty.',
        },
        {
          name: 'powod_korekty',
          type: 'checklist',
          label: 'Powód korekty (wybierz pasujące)',
          required: true,
          options: [
            {
              value: 'mandat_uchylony',
              label: 'Mandat został uchylony / sprzeciw uwzględniony',
              aiSuggested: true,
            },
            {
              value: 'punkty_zawyzone',
              label: 'Liczba punktów jest zawyżona w stosunku do taryfikatora',
              aiSuggested: true,
            },
            {
              value: 'wpis_duplikat',
              label: 'Duplikat wpisu (to samo zdarzenie wpisane dwukrotnie)',
            },
            {
              value: 'wpis_obcy',
              label: 'Wpis dotyczy innej osoby / błędna identyfikacja',
            },
            {
              value: 'punkty_przedawnione',
              label: 'Punkty powinny być wykasowane (upłynęło 12 m-cy)',
              aiSuggested: true,
            },
            {
              value: 'kurs_redukcyjny',
              label: 'Ukończono kurs redukcyjny — punkty nie zostały odjęte',
            },
          ],
        },
        {
          name: 'data_kursu',
          type: 'date',
          label: 'Data ukończenia kursu redukcyjnego',
          required: true,
          conditionalOn: { field: 'powod_korekty', value: 'kurs_redukcyjny' },
        },
        {
          name: 'ma_dowody',
          type: 'checkbox',
          label: 'Posiadam dokumenty (uchylone mandaty, zaświadczenia z kursu)',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// T1 — Pełnomocnictwo procesowe (ogólne lub szczególne)
// ============================================================================

const T1_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Dane mocodawcy i pełnomocnika',
      description: 'Pełnomocnictwo procesowe — do reprezentacji w sprawach urzędowych / sądowych.',
      fields: [
        {
          name: 'mocodawca_imie_nazwisko',
          type: 'text',
          label: 'Imię i nazwisko mocodawcy (Twoje)',
          required: true,
        },
        {
          name: 'mocodawca_pesel',
          type: 'text',
          label: 'PESEL mocodawcy',
          placeholder: '11 cyfr',
          required: true,
          validation: { pattern: '^\\d{11}$', patternMessage: 'PESEL musi mieć 11 cyfr.' },
          width: 'half',
        },
        {
          name: 'mocodawca_adres',
          type: 'text',
          label: 'Adres mocodawcy',
          required: true,
          width: 'half',
        },
        {
          name: 'pelnomocnik_imie_nazwisko',
          type: 'text',
          label: 'Imię i nazwisko pełnomocnika',
          required: true,
        },
        {
          name: 'pelnomocnik_pesel',
          type: 'text',
          label: 'PESEL pełnomocnika',
          placeholder: '11 cyfr',
          required: false,
          validation: { pattern: '^\\d{11}$', patternMessage: 'PESEL musi mieć 11 cyfr.' },
          width: 'half',
        },
        {
          name: 'pelnomocnik_adres',
          type: 'text',
          label: 'Adres pełnomocnika',
          required: true,
          width: 'half',
        },
        {
          name: 'pelnomocnik_relacja',
          type: 'select',
          label: 'Relacja pełnomocnika z mocodawcą',
          required: true,
          options: [
            { value: 'rodzina', label: 'Członek rodziny' },
            { value: 'malzonek', label: 'Małżonek' },
            { value: 'adwokat', label: 'Adwokat / radca prawny' },
            { value: 'znajomy', label: 'Inna zaufana osoba' },
          ],
        },
      ],
    },
    {
      title: 'Zakres umocowania',
      description: 'Im węższy zakres, tym bezpieczniej — wybierz konkretną sprawę.',
      fields: [
        {
          name: 'rodzaj_pelnomocnictwa',
          type: 'radio',
          label: 'Rodzaj pełnomocnictwa',
          required: true,
          options: [
            {
              value: 'szczegolne',
              label: 'Szczególne — do konkretnej sprawy',
              aiSuggested: true,
              hint: 'AI rekomenduje — bezpieczniejsze, węższy zakres.',
            },
            { value: 'ogolne', label: 'Ogólne — do reprezentowania w sprawach administracyjnych' },
            { value: 'procesowe', label: 'Procesowe — do reprezentowania w sądzie' },
          ],
        },
        {
          name: 'opis_sprawy',
          type: 'textarea',
          label: 'Opis sprawy (sygnatura, organ, przedmiot)',
          placeholder:
            'np. Sprawa o sygn. AB/123 przed SR Warszawa-Śródmieście — odwołanie od mandatu.',
          required: true,
          conditionalOn: { field: 'rodzaj_pelnomocnictwa', value: 'szczegolne' },
          validation: { minLength: 30, maxLength: 1500 },
        },
        {
          name: 'zakres_czynnosci',
          type: 'checklist',
          label: 'Zakres czynności pełnomocnika',
          required: true,
          options: [
            { value: 'odbior_korespondencji', label: 'Odbiór korespondencji', aiSuggested: true },
            { value: 'skladanie_pism', label: 'Składanie pism procesowych', aiSuggested: true },
            { value: 'reprezentacja_rozprawa', label: 'Reprezentacja na rozprawie' },
            { value: 'zawieranie_ugod', label: 'Zawieranie ugód' },
            { value: 'wnioski_dowodowe', label: 'Składanie wniosków dowodowych' },
            { value: 'rezygnacja_apelacja', label: 'Rezygnacja z apelacji / kasacji' },
          ],
        },
        {
          name: 'data_waznosci_do',
          type: 'date',
          label: 'Data ważności do (opcjonalnie)',
          required: false,
          helpText: 'Pozostaw puste dla pełnomocnictwa bezterminowego.',
        },
      ],
    },
  ],
}

// ============================================================================
// T2 — Wniosek o dostęp do danych RODO (art. 15)
// ============================================================================

const T2_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Administrator danych',
      description: 'Wniosek o udostępnienie danych — RODO art. 15. Termin 30 dni na odpowiedź.',
      fields: [
        {
          name: 'rodzaj_administratora',
          type: 'select',
          label: 'Rodzaj administratora',
          required: true,
          options: [
            { value: 'policja', label: 'Policja' },
            { value: 'straz_miejska', label: 'Straż Miejska / Gminna' },
            { value: 'zdm', label: 'Zarząd Dróg Miejskich' },
            { value: 'firma_parkingowa', label: 'Firma parkingowa (APCOA, EuroPark, etc.)' },
            { value: 'ubezpieczyciel', label: 'Ubezpieczyciel' },
            { value: 'bank', label: 'Bank / instytucja finansowa' },
            { value: 'firma_windykacyjna', label: 'Firma windykacyjna' },
            { value: 'gitd', label: 'GITD / e-TOLL' },
            { value: 'urzad', label: 'Urząd / organ administracji publicznej' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'nazwa_administratora',
          type: 'text',
          label: 'Pełna nazwa administratora',
          placeholder: 'np. Komenda Stołeczna Policji',
          required: true,
        },
        {
          name: 'adres_administratora',
          type: 'text',
          label: 'Adres administratora',
          required: true,
        },
        {
          name: 'kontekst_sprawy',
          type: 'text',
          label: 'Kontekst sprawy (opcjonalnie)',
          placeholder: 'np. Mandat nr AB1234567 z 12.03.2024',
          required: false,
        },
      ],
    },
    {
      title: 'Zakres żądanych danych',
      description: 'AI sformułuje pismo na bazie RODO art. 15 (prawo dostępu).',
      fields: [
        {
          name: 'zakres_danych',
          type: 'checklist',
          label: 'Zakres żądanych informacji',
          required: true,
          options: [
            { value: 'cele_przetwarzania', label: 'Cele przetwarzania danych', aiSuggested: true },
            {
              value: 'kategorie_danych',
              label: 'Kategorie przetwarzanych danych',
              aiSuggested: true,
            },
            { value: 'odbiorcy', label: 'Odbiorcy danych (komu udostępniono)', aiSuggested: true },
            { value: 'okres_przechowywania', label: 'Planowany okres przechowywania' },
            { value: 'zrodlo_pozyskania', label: 'Źródło pozyskania danych' },
            {
              value: 'kopia_danych',
              label: 'Kopia wszystkich danych mnie dotyczących',
              aiSuggested: true,
            },
            {
              value: 'profilowanie',
              label: 'Informacja o profilowaniu / decyzjach automatycznych',
            },
            { value: 'transfer_panstwa', label: 'Transfer danych do państw trzecich' },
          ],
        },
        {
          name: 'forma_odpowiedzi',
          type: 'select',
          label: 'Preferowana forma odpowiedzi',
          required: true,
          options: [
            { value: 'email', label: 'E-mail' },
            { value: 'list', label: 'List polecony' },
            { value: 'epuap', label: 'ePUAP / Profil Zaufany' },
            { value: 'osobisty_odbior', label: 'Osobisty odbiór' },
          ],
        },
        {
          name: 'kontakt_email',
          type: 'email',
          label: 'E-mail do odpowiedzi',
          required: true,
          conditionalOn: { field: 'forma_odpowiedzi', value: 'email' },
        },
      ],
    },
  ],
}

// ============================================================================
// T3 — Wniosek o usunięcie danych RODO (art. 17 — prawo do bycia zapomnianym)
// ============================================================================

const T3_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Administrator i zakres usunięcia',
      description: 'Wniosek o usunięcie danych — RODO art. 17. Wymaga uzasadnienia.',
      fields: [
        {
          name: 'rodzaj_administratora',
          type: 'select',
          label: 'Rodzaj administratora',
          required: true,
          options: [
            { value: 'firma_parkingowa', label: 'Firma parkingowa' },
            { value: 'ubezpieczyciel', label: 'Ubezpieczyciel' },
            { value: 'bank', label: 'Bank' },
            { value: 'firma_windykacyjna', label: 'Firma windykacyjna' },
            { value: 'sklep_internetowy', label: 'Sklep internetowy' },
            { value: 'platforma_internetowa', label: 'Platforma internetowa / portal' },
            { value: 'biuro_informacji', label: 'Biuro informacji (KRD/BIK/BIG)' },
            { value: 'newsletter', label: 'Lista mailingowa / newsletter' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        {
          name: 'nazwa_administratora',
          type: 'text',
          label: 'Pełna nazwa administratora',
          required: true,
        },
        {
          name: 'kontekst_relacji',
          type: 'textarea',
          label: 'Kontekst relacji z administratorem',
          placeholder: 'np. Byłem klientem firmy X od 2018 do 2022, zerwana umowa.',
          required: true,
          validation: { minLength: 30, maxLength: 1500 },
        },
        {
          name: 'zakres_usuniecia',
          type: 'radio',
          label: 'Zakres usunięcia',
          required: true,
          options: [
            { value: 'wszystkie', label: 'Wszystkie dane mnie dotyczące', aiSuggested: true },
            { value: 'czesciowy', label: 'Częściowe (tylko niektóre dane)' },
          ],
        },
        {
          name: 'opis_zakresu',
          type: 'textarea',
          label: 'Konkretne kategorie danych do usunięcia',
          placeholder: 'np. dane kontaktowe, historia transakcji, zdjęcia.',
          required: true,
          conditionalOn: { field: 'zakres_usuniecia', value: 'czesciowy' },
          validation: { maxLength: 1500 },
        },
      ],
    },
    {
      title: 'Podstawa usunięcia',
      description: 'AI dobiera odpowiednią przesłankę z RODO art. 17 ust. 1.',
      fields: [
        {
          name: 'podstawa_prawna',
          type: 'radio',
          label: 'Podstawa wniosku (RODO art. 17 ust. 1)',
          required: true,
          options: [
            {
              value: 'cel_zrealizowany',
              label: 'Dane są już zbędne do celu, dla którego zostały zebrane (lit. a)',
              aiSuggested: true,
            },
            {
              value: 'cofniecie_zgody',
              label: 'Cofam zgodę na przetwarzanie (lit. b)',
              aiSuggested: true,
            },
            {
              value: 'sprzeciw',
              label: 'Wnoszę sprzeciw wobec przetwarzania (lit. c)',
            },
            {
              value: 'niezgodne_z_prawem',
              label: 'Dane są przetwarzane niezgodnie z prawem (lit. d)',
            },
            {
              value: 'obowiazek_prawny',
              label: 'Konieczność wynikająca z obowiązku prawnego (lit. e)',
            },
          ],
        },
        {
          name: 'opis_uzasadnienia',
          type: 'textarea',
          label: 'Szczegółowe uzasadnienie',
          placeholder: 'Konkretnie wskaż dlaczego podstawa prawna ma zastosowanie.',
          required: true,
          validation: { minLength: 50, maxLength: 2500 },
        },
        {
          name: 'potwierdzenie_usuniecia',
          type: 'checkbox',
          label: 'Wnoszę o pisemne potwierdzenie usunięcia danych',
          required: false,
        },
      ],
    },
  ],
}

// ============================================================================
// T4 — Lista załączników (generowana automatycznie do każdego pisma)
// ============================================================================

const T4_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      title: 'Lista załączników',
      description:
        'Pismo techniczne — automatycznie generowane jako załącznik do głównego dokumentu.',
      fields: [
        {
          name: 'sprawa_glowna',
          type: 'text',
          label: 'Numer / opis sprawy głównej',
          placeholder: 'np. Sprzeciw od mandatu nr AB123 z 12.03.2024',
          required: true,
        },
        {
          name: 'organ_adresat',
          type: 'text',
          label: 'Organ — adresat pisma',
          placeholder: 'np. Komenda Stołeczna Policji',
          required: true,
        },
        {
          name: 'lista_zalacznikow',
          type: 'textarea',
          label: 'Lista załączników (po jednym w wierszu)',
          placeholder:
            '1. Kopia mandatu z 12.03.2024\n2. Zdjęcie miejsca zdarzenia\n3. Świadectwo legalizacji urządzenia\n...',
          required: true,
          validation: { minLength: 30, maxLength: 3000 },
          helpText: 'Każdy załącznik osobno — AI przygotuje sformatowaną listę z numerami.',
        },
        {
          name: 'liczba_egzemplarzy',
          type: 'number',
          label: 'Liczba egzemplarzy załączników',
          required: true,
          validation: { min: 1, max: 5 },
          helpText: 'Standardowo 1 egzemplarz dla organu + 1 do akt własnych.',
        },
      ],
    },
  ],
}

// ============================================================================
// EXPORT — mapa typ → schema
// ============================================================================

/**
 * Mapowanie wszystkich 30 typów pism (zgodnie z bazą wiedzy T16+T17) na
 * form schemas. M5 dzieli wariant DB enum z M4 (`mandat_odwolanie_straz`),
 * ale ma osobny schema na poziomie UI (krótki opis fotoradarowy).
 *
 * `loadFormSchema()` zwraca `null` dla typów spoza tej mapy (np. `scoring_szans`).
 */
export const FORM_SCHEMAS: Partial<Record<CaseType, FormSchema>> = {
  // Mandaty (7)
  M1_mandat_predkosc: M1_SCHEMA,
  M2_mandat_odmowa_przyjecia: M2_SCHEMA,
  M3_mandat_uchylenie: M3_SCHEMA,
  M4_mandat_straz_gminna: M4_SCHEMA,
  M5_mandat_straz_fotoradar: M5_SCHEMA,
  M6_mandat_itd: M6_SCHEMA,
  M7_mandat_odroczenie_raty: M7_SCHEMA,

  // Parking (4)
  P1_parking_spp: P1_SCHEMA,
  P2_parking_zdm: P2_SCHEMA,
  P3_parking_ztm: P3_SCHEMA,
  P4_parking_blad_identyfikacji: P4_SCHEMA,

  // Windykacja (5)
  W1_windykacja_przedawnienie: W1_SCHEMA,
  W2_windykacja_odpowiedz: W2_SCHEMA,
  W3_windykacja_sprzeciw_epu: W3_SCHEMA,
  W4_windykacja_krd_bik: W4_SCHEMA,
  W5_windykacja_skarga_rf: W5_SCHEMA,

  // Ubezpieczenia (3)
  U1_ubezp_odwolanie_decyzja: U1_SCHEMA,
  U2_ubezp_wezwanie_wyplata: U2_SCHEMA,
  U3_ubezp_skarga_rf: U3_SCHEMA,

  // e-TOLL (3)
  E1_etoll_odwolanie_kara: E1_SCHEMA,
  E2_etoll_reklamacja_podwojne: E2_SCHEMA,
  E3_etoll_anulowanie: E3_SCHEMA,

  // Kontrole (4)
  K1_kontrola_zatrzymanie_pj: K1_SCHEMA,
  K2_kontrola_cofniecie_cepik: K2_SCHEMA,
  K3_kontrola_weryfikacja_urzadzenia: K3_SCHEMA,
  K4_kontrola_korekta_punktow: K4_SCHEMA,

  // Techniczne (4)
  T1_techn_pelnomocnictwo: T1_SCHEMA,
  T2_techn_rodo_dostep: T2_SCHEMA,
  T3_techn_rodo_usuniecie: T3_SCHEMA,
  T4_techn_lista_zalacznikow: T4_SCHEMA,
}

/** Helper: czy istnieje schema dla danego typu (= czy MVP). */
export function hasFormSchema(type: CaseType): boolean {
  return type in FORM_SCHEMAS
}
