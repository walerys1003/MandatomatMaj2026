/**
 * Welcome drip campaign — 5 emaili w 7 dni (T6-ONB-002).
 *
 * Sekwencja:
 *  - Day 0 (immediate): Witaj + tutorial link
 *  - Day 1: "Pierwsza sprawa za darmo (scoring)"
 *  - Day 3: Case study sukcesu
 *  - Day 5: Porady prawne (link do bloga)
 *  - Day 7: 20% rabat jeśli nie kupił (Stripe coupon)
 *
 * Architektura: każdy email scheduled przez Inngest `step.sleepUntil()`.
 * Cancellation: gdy user wykona docelową akcję (np. zapłaci) — kolejne maile cancellable
 * przez sprawdzenie `profiles.first_paid_at` w handler-ze.
 */

import { escapeHtml } from '@/lib/notifications/templates'

const SITE = 'https://mandatomat.pl'

function shell(opts: { title: string; preheader: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
<div style="display:none;font-size:1px;color:#f9fafb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
<tr><td style="padding:32px 32px 16px;border-bottom:1px solid #e5e7eb;">
<a href="${SITE}" style="text-decoration:none;color:#2563eb;font-weight:700;font-size:18px;">Mandatomat<span style="color:#111827;">.pl</span></a>
</td></tr>
<tr><td style="padding:24px 32px;">${opts.bodyHtml}</td></tr>
<tr><td style="padding:16px 32px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
Nie chcesz dostawać tych wiadomości? <a href="${SITE}/ustawienia#email" style="color:#6b7280;">Wyłącz powiadomienia</a>.
</td></tr></table></td></tr></table></body></html>`
}

export interface DripContext {
  imie?: string | null
  email: string
}

export function dripDay0(ctx: DripContext): { subject: string; html: string } {
  const greeting = ctx.imie ? `Cześć ${escapeHtml(ctx.imie)}!` : 'Cześć!'
  return {
    subject: 'Witaj w Mandatomacie — zacznij od darmowego skanu szans',
    html: shell({
      title: 'Witaj w Mandatomacie',
      preheader: 'Pierwsze 30 sekund: sprawdź szanse za darmo.',
      bodyHtml: `
<h1 style="font-size:24px;margin:0 0 16px;">${greeting}</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Cieszymy się, że jesteś z nami. Mandatomat pomaga Ci napisać profesjonalne pismo prawne w 5 minut — bez prawnika.</p>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;"><strong>Najlepszy pierwszy krok:</strong> sprawdź za darmo czy Twoja sprawa ma szansę. Bez logowania, bez płatności.</p>
<p style="margin:24px 0;"><a href="${SITE}/sprawdz-szanse" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Sprawdź szanse za darmo →</a></p>
<p style="font-size:14px;color:#6b7280;margin:24px 0 0;">PS: Jutro wyślę Ci tutorial krok-po-kroku.</p>`,
    }),
  }
}

export function dripDay1(ctx: DripContext): { subject: string; html: string } {
  return {
    subject: 'Tutorial: jak napisać odwołanie w 5 minut',
    html: shell({
      title: 'Tutorial Mandatomat',
      preheader: 'Krok po kroku — pokażemy Ci jak to działa.',
      bodyHtml: `
<h1 style="font-size:24px;margin:0 0 16px;">Jak to działa?</h1>
<ol style="font-size:16px;line-height:1.7;padding-left:20px;margin:0 0 24px;">
<li><strong>Wybierz typ sprawy</strong> — mandat, parking, e-TOLL, windykacja itd.</li>
<li><strong>Opisz sytuację</strong> w prostym formularzu (15 pól, 3-5 min).</li>
<li><strong>AI tworzy pismo</strong> dopasowane do podstaw prawnych Twojej sprawy.</li>
<li><strong>Pobierz PDF</strong> — gotowy do wysyłki listem poleconym.</li>
</ol>
<p style="margin:24px 0;"><a href="${SITE}/sprawy/nowa" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Zacznij swoją pierwszą sprawę →</a></p>
<p style="font-size:14px;color:#6b7280;">Średni czas: 5 minut. Skuteczność: <strong>~70%</strong> przy poprawnie wypełnionych formularzach.</p>`,
    }),
  }
}

export function dripDay3(_ctx: DripContext): { subject: string; html: string } {
  return {
    subject: 'Case study: jak Tomasz uchylił mandat 500 zł',
    html: shell({
      title: 'Case study Mandatomat',
      preheader: 'Prawdziwa historia: mandat za fotoradar uchylony w 3 tygodnie.',
      bodyHtml: `
<h1 style="font-size:24px;margin:0 0 16px;">"Nie wierzyłem, że to zadziała"</h1>
<blockquote style="border-left:4px solid #2563eb;padding:8px 0 8px 16px;margin:0 0 24px;color:#374151;font-style:italic;">
Dostałem mandat 500 zł z fotoradaru. Wpisałem dane do Mandatomatu, AI napisało pismo powołując się na art. 96 § 3 KW. Wysłałem listem poleconym, po 3 tygodniach przyszła odpowiedź: <strong>postępowanie umorzone</strong>. Koszt: 99 zł zamiast 500 zł.
<br><br>— Tomasz, Warszawa
</blockquote>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;">Czy Twoja sprawa może skończyć się podobnie? <strong>Sprawdź szanse za darmo</strong> — bez ryzyka, bez logowania.</p>
<p style="margin:24px 0;"><a href="${SITE}/sprawdz-szanse" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Sprawdź teraz →</a></p>`,
    }),
  }
}

export function dripDay5(_ctx: DripContext): { subject: string; html: string } {
  return {
    subject: '5 najczęstszych błędów przy odwołaniach od mandatu',
    html: shell({
      title: 'Porady prawne',
      preheader: 'Co warto wiedzieć przed napisaniem odwołania.',
      bodyHtml: `
<h1 style="font-size:24px;margin:0 0 16px;">5 najczęstszych błędów</h1>
<ol style="font-size:16px;line-height:1.7;padding-left:20px;margin:0 0 24px;">
<li><strong>Brak terminu</strong> — masz 7 dni na odmowę przyjęcia mandatu (art. 97 § 2 KW).</li>
<li><strong>Brak podstawy prawnej</strong> — pismo musi powoływać się na konkretny przepis.</li>
<li><strong>Emocjonalny język</strong> — urząd ignoruje "to niesprawiedliwe"; liczą się fakty.</li>
<li><strong>Brak załączników</strong> — zdjęcia, ekspertyzy, świadkowie mocno pomagają.</li>
<li><strong>Wysłanie zwykłym listem</strong> — zawsze list polecony za potwierdzeniem.</li>
</ol>
<p style="margin:24px 0;"><a href="${SITE}/blog/jak-odwolac-mandat-z-fotoradaru" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Czytaj pełny przewodnik →</a></p>`,
    }),
  }
}

export function dripDay7(_ctx: DripContext): { subject: string; html: string } {
  return {
    subject: '20% rabatu na pierwsze pismo — ważne 48h',
    html: shell({
      title: 'Rabat 20% Mandatomat',
      preheader: 'Ostatni dzwonek — kod WELCOME20 ważny 48h.',
      bodyHtml: `
<h1 style="font-size:24px;margin:0 0 16px;">Twój kod: <span style="color:#2563eb;">WELCOME20</span></h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 16px;"><strong>20% zniżki</strong> na pierwsze wygenerowane pismo. Zamiast 99 zł zapłacisz <strong>79,20 zł</strong>.</p>
<p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Kod ważny przez 48h. Wpisz go w koszyku przy płatności.</p>
<p style="margin:24px 0;"><a href="${SITE}/sprawy/nowa" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Wykorzystaj kod →</a></p>
<p style="font-size:13px;color:#9ca3af;margin:24px 0 0;">Promocja ważna tylko dla pierwszych zakupów. Nie łączy się z innymi rabatami.</p>`,
    }),
  }
}

export const DRIP_SCHEDULE = [
  { day: 0, builder: dripDay0, label: 'welcome' },
  { day: 1, builder: dripDay1, label: 'tutorial' },
  { day: 3, builder: dripDay3, label: 'case-study' },
  { day: 5, builder: dripDay5, label: 'tips' },
  { day: 7, builder: dripDay7, label: 'discount' },
] as const
