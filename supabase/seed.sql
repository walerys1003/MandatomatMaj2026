-- Mandatomat — seed danych dla MVP fazy 2 (5 typów priorytetowych).
--
-- Source: plan/02_tier1_foundation.md punkt 30 (T1-DB-030)
-- Pełen seed 34 typów dostarczy Tier 3 (T16/T17 — katalog pism).
--
-- Priorytety:
--   M1: mandat_sprzeciw_predkosc
--   M4: mandat_odwolanie_straz
--   P1: parking_sprzeciw_prywatny
--   P3: parking_odwolanie_ztm
--   W1: windykacja_odpowiedz_wezwanie

INSERT INTO public.case_type_config (
    case_type, category, display_name, short_name, description, icon,
    price_pln, form_schema, default_deadline_days, deadline_legal_basis,
    prompt_file, default_addressee_type, slug, sort_order
) VALUES
    (
        'mandat_sprzeciw_predkosc', 'mandaty',
        'Sprzeciw od mandatu za prędkość',
        'Mandat — prędkość',
        'Wzór sprzeciwu od mandatu karnego nałożonego za przekroczenie dozwolonej prędkości. Możesz zakwestionować pomiar, wadliwe oznakowanie, błędną identyfikację kierowcy.',
        'Gauge',
        7900,
        '{"fields":[{"name":"data_zdarzenia","type":"date","required":true,"label":"Data zdarzenia"},{"name":"data_doreczenia","type":"date","required":true,"label":"Data doręczenia mandatu"},{"name":"miejsce","type":"text","required":true,"label":"Miejsce zdarzenia (ulica, miejscowość)"},{"name":"predkosc_zmierzona","type":"number","required":true,"label":"Zmierzona prędkość (km/h)"},{"name":"predkosc_dopuszczalna","type":"number","required":true,"label":"Dopuszczalna prędkość (km/h)"},{"name":"podstawa_sprzeciwu","type":"select","required":true,"label":"Podstawa sprzeciwu","options":["bledny_pomiar","brak_oznakowania","nie_byl_kierowca","inne"]},{"name":"opis_okolicznosci","type":"textarea","required":true,"label":"Opis okoliczności","minLength":40}]}',
        7,
        'art. 99 § 1 KPW (7 dni od doręczenia)',
        'mandaty/M1_sprzeciw_predkosc.md',
        'sad',
        'sprzeciw-mandat-predkosc',
        1
    ),
    (
        'mandat_odwolanie_straz', 'mandaty',
        'Odwołanie od mandatu Straży Miejskiej / Gminnej',
        'Mandat — Straż Miejska',
        'Sprzeciw od mandatu nałożonego przez Straż Miejską lub Gminną — np. za parkowanie w miejscu niedozwolonym, brak biletu w SPP, uciążliwy hałas.',
        'BadgeCheck',
        7900,
        '{"fields":[{"name":"data_zdarzenia","type":"date","required":true,"label":"Data zdarzenia"},{"name":"data_doreczenia","type":"date","required":true,"label":"Data doręczenia"},{"name":"miejsce","type":"text","required":true,"label":"Miejsce zdarzenia"},{"name":"organ_wystawiajacy","type":"text","required":true,"label":"Pełna nazwa Straży Miejskiej / Gminnej"},{"name":"podstawa_sprzeciwu","type":"select","required":true,"label":"Podstawa sprzeciwu","options":["brak_uprawnien_funkcjonariusza","brak_oznakowania","blednie_zidentyfikowane_zdarzenie","inne"]},{"name":"opis_okolicznosci","type":"textarea","required":true,"label":"Opis okoliczności","minLength":40}]}',
        7,
        'art. 99 § 1 KPW (7 dni od doręczenia)',
        'mandaty/M4_odwolanie_straz.md',
        'sad',
        'odwolanie-mandat-straz-miejska',
        2
    ),
    (
        'parking_sprzeciw_prywatny', 'parking',
        'Sprzeciw od opłaty z parkingu prywatnego',
        'Parking prywatny',
        'Reklamacja roszczenia naliczonego przez prywatny parking (galeria, market, Park&Ride). Często bez podstawy prawnej, wezwanie do zapłaty można skutecznie zakwestionować.',
        'CircleParking',
        5900,
        '{"fields":[{"name":"data_zdarzenia","type":"date","required":true,"label":"Data zdarzenia"},{"name":"data_pisma","type":"date","required":true,"label":"Data otrzymania wezwania"},{"name":"miejsce","type":"text","required":true,"label":"Nazwa parkingu / centrum"},{"name":"kwota_naliczona","type":"number","required":true,"label":"Kwota wezwania (zł)"},{"name":"podstawa_sprzeciwu","type":"select","required":true,"label":"Podstawa sprzeciwu","options":["brak_umowy","brak_oznakowania","wadliwa_identyfikacja","kwota_nieproporcjonalna","inne"]},{"name":"opis_okolicznosci","type":"textarea","required":true,"label":"Opis okoliczności","minLength":40}]}',
        14,
        'KC art. 471 + 5 (klauzule abuzywne, brak podstawy roszczenia)',
        'parking/P1_sprzeciw_prywatny.md',
        'parking_prywatny',
        3
    ),
    (
        'parking_odwolanie_ztm', 'parking',
        'Odwołanie od opłaty dodatkowej ZTM/MPK (gapowicz)',
        'Parking — ZTM/MPK',
        'Odwołanie od kary za jazdę bez biletu, niewłaściwą strefę lub niesfinalizowane skasowanie — wzór z mocnymi podstawami z ustawy o publicznym transporcie zbiorowym.',
        'Train',
        4900,
        '{"fields":[{"name":"data_kontroli","type":"date","required":true,"label":"Data kontroli biletu"},{"name":"data_doreczenia","type":"date","required":true,"label":"Data doręczenia opłaty"},{"name":"miasto","type":"text","required":true,"label":"Miasto"},{"name":"przewoznik","type":"text","required":true,"label":"Przewoźnik (np. ZTM Warszawa)"},{"name":"kwota_naliczona","type":"number","required":true,"label":"Kwota opłaty (zł)"},{"name":"podstawa_sprzeciwu","type":"select","required":true,"label":"Podstawa sprzeciwu","options":["bilet_byl","awaria_kasownika","brak_strefy","wadliwa_identyfikacja","inne"]},{"name":"opis_okolicznosci","type":"textarea","required":true,"label":"Opis okoliczności","minLength":40}]}',
        14,
        'art. 33a ust. 6 ustawy o transporcie zbiorowym',
        'parking/P3_odwolanie_ztm.md',
        'ztm',
        4
    ),
    (
        'windykacja_odpowiedz_wezwanie', 'windykacja',
        'Odpowiedź na wezwanie do zapłaty / firmy windykacyjnej',
        'Windykacja — wezwanie',
        'Profesjonalna odpowiedź na wezwanie do zapłaty — z zarzutami przedawnienia, braku podstawy prawnej, naruszenia RODO. Często skutkuje umorzeniem.',
        'FileWarning',
        7900,
        '{"fields":[{"name":"nazwa_firmy","type":"text","required":true,"label":"Nazwa firmy windykacyjnej"},{"name":"data_pisma","type":"date","required":true,"label":"Data pisma od windykatora"},{"name":"data_doreczenia","type":"date","required":true,"label":"Data doręczenia"},{"name":"kwota_zadania","type":"number","required":true,"label":"Kwota żądania (zł)"},{"name":"data_pierwotnej_umowy","type":"date","required":false,"label":"Data pierwotnej umowy / zobowiązania"},{"name":"podstawa_sprzeciwu","type":"checkbox-group","required":true,"label":"Zarzuty (zaznacz wszystkie pasujące)","options":["przedawnienie","brak_dokumentow","kwota_nieprawidlowa","brak_podstawy","naruszenie_rodo","cesja_nieskuteczna"]},{"name":"opis_okolicznosci","type":"textarea","required":true,"label":"Opis sprawy","minLength":80}]}',
        14,
        'KC art. 117-118 (przedawnienie) + KPC art. 491',
        'windykacja/W1_odpowiedz_wezwanie.md',
        'firma_windykacyjna',
        5
    )
ON CONFLICT (case_type) DO NOTHING;
