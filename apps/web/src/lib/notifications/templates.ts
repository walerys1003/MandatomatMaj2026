/**
 * Email templates — pure HTML, Edge-compatible.
 *
 * NIE używamy @react-email/render (Node-only ESM, problemy z Edge bundle).
 * Plain HTML z inline CSS — kompatybilne ze wszystkimi klientami pocztowymi.
 *
 * Templates:
 *  - deadline-d5 / d3 / d1 / d0 — przypomnienia o terminie
 *  - welcome — po rejestracji
 *  - payment-success — po opłaceniu
 */

const BRAND = {
  primary: '#2563eb', // brand-600
  bg: '#f9fafb',      // iron-50
  text: '#111827',    // iron-900
  muted: '#6b7280',   // iron-500
  signal: '#dc2626',
  amber: '#d97706',
  success: '#059669',
}

function shell(opts: { title: string; preheader?: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
${opts.preheader ? `<div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(opts.preheader)}</div>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
        <tr>
          <td style="padding:32px 32px 16px 32px;border-bottom:1px solid #e5e7eb;">
            <a href="https://mandatomat.pl" style="text-decoration:none;color:${BRAND.primary};font-weight:700;font-size:18px;letter-spacing:-0.01em;">
              Mandatomat<span style="color:${BRAND.text};">.pl</span>
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;">
            ${opts.bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 32px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:${BRAND.muted};">
            <p style="margin:0 0 8px 0;">Otrzymujesz ten e-mail, ponieważ masz konto w Mandatomat.pl.</p>
            <p style="margin:0;">
              <a href="https://mandatomat.pl/ustawienia" style="color:${BRAND.muted};">Zarządzaj powiadomieniami</a>
              · <a href="https://mandatomat.pl/polityka-prywatnosci" style="color:${BRAND.muted};">Polityka prywatności</a>
              · <a href="mailto:pomoc@mandatomat.pl" style="color:${BRAND.muted};">Pomoc</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function button(label: string, href: string, color = BRAND.primary): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr><td align="center" bgcolor="${color}" style="border-radius:6px;">
      <a href="${escapeAttr(href)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;font-family:inherit;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;')
}

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
]

function formatPolishDate(d: Date): string {
  return `${d.getDate()} ${POLISH_MONTHS[d.getMonth()]} ${d.getFullYear()} r.`
}

// ============================================================
// Deadline templates (D-5, D-3, D-1, D-0)
// ============================================================

export interface DeadlineTemplateData {
  recipientName?: string | null
  caseTitle: string
  caseId: string
  deadlineDate: Date
  legalBasis?: string | null
}

export function tplDeadlineD5(d: DeadlineTemplateData): { subject: string; html: string } {
  const dateStr = formatPolishDate(d.deadlineDate)
  const url = `https://mandatomat.pl/sprawy/${d.caseId}`
  const subject = `Termin za 5 dni: ${d.caseTitle}`
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.text};">Twój termin zbliża się — masz jeszcze 5 dni</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      ${d.recipientName ? `Cześć ${escapeHtml(d.recipientName.split(' ')[0] ?? '')}!<br>` : ''}
      Przypominamy, że masz <strong>5 dni</strong> na reakcję w sprawie:
    </p>
    <div style="margin:16px 0;padding:16px;background:${BRAND.bg};border-radius:6px;border-left:4px solid ${BRAND.primary};">
      <p style="margin:0;font-weight:600;color:${BRAND.text};">${escapeHtml(d.caseTitle)}</p>
      <p style="margin:8px 0 0 0;color:${BRAND.muted};font-size:13px;">Termin: <strong>${dateStr}</strong></p>
      ${d.legalBasis ? `<p style="margin:4px 0 0 0;color:${BRAND.muted};font-size:13px;">${escapeHtml(d.legalBasis)}</p>` : ''}
    </div>
    ${button('Zobacz sprawę', url)}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">
      Pamiętaj — jeśli masz wątpliwości, kliknij „Zobacz sprawę”. Tam znajdziesz wszystkie szczegóły i pisma.
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: `5 dni do terminu: ${d.caseTitle}`, bodyHtml: body }) }
}

export function tplDeadlineD3(d: DeadlineTemplateData): { subject: string; html: string } {
  const dateStr = formatPolishDate(d.deadlineDate)
  const url = `https://mandatomat.pl/sprawy/${d.caseId}`
  const subject = `⚠️ Tylko 3 dni: ${d.caseTitle}`
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.amber};">Zostały tylko 3 dni</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      ${d.recipientName ? `${escapeHtml(d.recipientName.split(' ')[0] ?? '')}, ` : ''}termin zbliża się szybko. Masz <strong>3 dni</strong>, by zareagować w sprawie:
    </p>
    <div style="margin:16px 0;padding:16px;background:#fef3c7;border-radius:6px;border-left:4px solid ${BRAND.amber};">
      <p style="margin:0;font-weight:600;color:${BRAND.text};">${escapeHtml(d.caseTitle)}</p>
      <p style="margin:8px 0 0 0;color:${BRAND.text};font-size:13px;">Termin: <strong>${dateStr}</strong></p>
      ${d.legalBasis ? `<p style="margin:4px 0 0 0;color:${BRAND.muted};font-size:13px;">${escapeHtml(d.legalBasis)}</p>` : ''}
    </div>
    ${button('Działaj teraz →', url, BRAND.amber)}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">
      Po upływie terminu sprawa może zostać rozstrzygnięta na Twoją niekorzyść.
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: `3 dni: ${d.caseTitle}`, bodyHtml: body }) }
}

export function tplDeadlineD1(d: DeadlineTemplateData): { subject: string; html: string } {
  const dateStr = formatPolishDate(d.deadlineDate)
  const url = `https://mandatomat.pl/sprawy/${d.caseId}`
  const subject = `🚨 JUTRO mija termin: ${d.caseTitle}`
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.signal};">Ostatnia szansa — termin mija JUTRO</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      ${d.recipientName ? `${escapeHtml(d.recipientName.split(' ')[0] ?? '')}, ` : ''}masz <strong style="color:${BRAND.signal};">tylko 1 dzień</strong> na reakcję:
    </p>
    <div style="margin:16px 0;padding:16px;background:#fee2e2;border-radius:6px;border-left:4px solid ${BRAND.signal};">
      <p style="margin:0;font-weight:600;color:${BRAND.text};">${escapeHtml(d.caseTitle)}</p>
      <p style="margin:8px 0 0 0;color:${BRAND.text};font-size:13px;">Termin: <strong>${dateStr}</strong> (jutro!)</p>
      ${d.legalBasis ? `<p style="margin:4px 0 0 0;color:${BRAND.muted};font-size:13px;">${escapeHtml(d.legalBasis)}</p>` : ''}
    </div>
    ${button('OTWÓRZ SPRAWĘ', url, BRAND.signal)}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">
      Jeśli pismo jest już opłacone i wydrukowane — wyślij je dziś listem poleconym. Liczy się data nadania.
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: `JUTRO termin: ${d.caseTitle}`, bodyHtml: body }) }
}

export function tplDeadlineD0(d: DeadlineTemplateData): { subject: string; html: string } {
  const dateStr = formatPolishDate(d.deadlineDate)
  const url = `https://mandatomat.pl/sprawy/${d.caseId}`
  const subject = `🚨 DZIŚ termin: ${d.caseTitle}`
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.signal};">Termin upływa DZISIAJ</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      Jeśli jeszcze nie wysłałeś pisma — zrób to <strong>dzisiaj</strong>. Liczy się data nadania (stempel pocztowy).
    </p>
    <div style="margin:16px 0;padding:16px;background:#fee2e2;border-radius:6px;border-left:4px solid ${BRAND.signal};">
      <p style="margin:0;font-weight:600;color:${BRAND.text};">${escapeHtml(d.caseTitle)}</p>
      <p style="margin:8px 0 0 0;color:${BRAND.text};font-size:13px;">Termin: <strong>${dateStr}</strong> (dziś)</p>
    </div>
    ${button('Otwórz sprawę', url, BRAND.signal)}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">
      Jeśli wysłałeś już pismo — oznacz termin jako zrealizowany w panelu.
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: `DZIŚ termin: ${d.caseTitle}`, bodyHtml: body }) }
}

// ============================================================
// Welcome (po rejestracji)
// ============================================================

export interface WelcomeTemplateData {
  recipientName?: string | null
  recipientEmail: string
}

export function tplWelcome(d: WelcomeTemplateData): { subject: string; html: string } {
  const subject = 'Witaj w Mandatomat.pl 🎉'
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.text};">${d.recipientName ? `Cześć ${escapeHtml(d.recipientName.split(' ')[0] ?? '')}!` : 'Witaj!'}</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      Cieszymy się, że jesteś z nami! Mandatomat to Twój prawny asystent — w 3 minuty pomożemy Ci przygotować profesjonalne pismo.
    </p>
    <h2 style="margin:24px 0 8px 0;font-size:16px;color:${BRAND.text};">Jak zacząć?</h2>
    <ol style="margin:0;padding-left:20px;color:${BRAND.text};font-size:14px;line-height:1.6;">
      <li>Wybierz typ sprawy (mandat, parking, wezwanie, windykacja…)</li>
      <li>Wypełnij krótki formularz (możesz załączyć zdjęcie pisma — OCR sam wypełni dane)</li>
      <li>AI wygeneruje pismo dopasowane do Twojej sytuacji</li>
      <li>Edytuj, zapłać, pobierz PDF — gotowe do druku i wysłania</li>
    </ol>
    ${button('Stwórz pierwsze pismo', 'https://mandatomat.pl/sprawy/nowa')}
    <p style="margin:16px 0 0 0;color:${BRAND.muted};font-size:13px;">
      Pytania? Napisz: <a href="mailto:pomoc@mandatomat.pl" style="color:${BRAND.primary};">pomoc@mandatomat.pl</a>
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: 'Twój prawny asystent jest gotowy', bodyHtml: body }) }
}

// ============================================================
// Payment success
// ============================================================

export interface PaymentSuccessTemplateData {
  recipientName?: string | null
  caseTitle: string
  caseId: string
  amountPln: number
  pdfUrl?: string | null
  invoiceUrl?: string | null
}

export function tplPaymentSuccess(d: PaymentSuccessTemplateData): { subject: string; html: string } {
  const url = `https://mandatomat.pl/sprawy/${d.caseId}/pobranie`
  const subject = `Płatność zaakceptowana — ${d.caseTitle}`
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:22px;color:${BRAND.success};">✓ Płatność zaakceptowana</h1>
    <p style="margin:0 0 12px 0;color:${BRAND.text};font-size:15px;line-height:1.5;">
      Dziękujemy! Twoje pismo jest gotowe do pobrania.
    </p>
    <div style="margin:16px 0;padding:16px;background:${BRAND.bg};border-radius:6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;">Sprawa</td>
          <td style="text-align:right;color:${BRAND.text};font-weight:600;">${escapeHtml(d.caseTitle)}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding-top:6px;">Kwota</td>
          <td style="text-align:right;color:${BRAND.text};font-weight:600;padding-top:6px;">${d.amountPln.toFixed(2).replace('.', ',')} zł</td>
        </tr>
      </table>
    </div>
    ${button('Pobierz PDF', d.pdfUrl ?? url)}
    ${d.invoiceUrl ? `<p style="margin:0 0 8px 0;font-size:14px;"><a href="${escapeAttr(d.invoiceUrl)}" style="color:${BRAND.primary};">Pobierz fakturę / paragon</a></p>` : ''}
    <p style="margin:16px 0 0 0;color:${BRAND.muted};font-size:13px;">
      Wydrukuj pismo (A4), podpisz odręcznie i wyślij listem poleconym. Liczy się data nadania.
    </p>
  `
  return { subject, html: shell({ title: subject, preheader: `Pismo gotowe: ${d.caseTitle}`, bodyHtml: body }) }
}
