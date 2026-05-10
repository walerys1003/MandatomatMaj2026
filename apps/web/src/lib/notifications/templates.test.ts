import { describe, expect, it } from 'vitest'

import {
  renderTemplate,
  tplDeadlineD0,
  tplDeadlineD1,
  tplDeadlineD3,
  tplDeadlineD5,
  tplDocumentReady,
  tplInvoice,
  tplPasswordReset,
  tplPaymentSuccess,
  tplWelcome,
} from './templates'

describe('email templates — deadline series', () => {
  const base = {
    recipientName: 'Jan Kowalski',
    caseTitle: 'Mandat Straży Miejskiej',
    caseId: '11111111-2222-3333-4444-555555555555',
    deadlineDate: new Date('2026-06-15T12:00:00Z'),
    legalBasis: 'art. 99 § 1 KPSW',
  }

  it('D5 wskazuje 5 dni i kolor primary', () => {
    const { subject, html } = tplDeadlineD5(base)
    expect(subject).toContain('5 dni')
    expect(html).toContain('Mandat Straży Miejskiej')
    expect(html).toContain('art. 99')
  })

  it('D3 zawiera ostrzeżenie i kolor amber', () => {
    const { subject, html } = tplDeadlineD3(base)
    expect(subject).toContain('3 dni')
    expect(html).toContain('#d97706')
  })

  it('D1 zawiera "JUTRO" i kolor signal', () => {
    const { subject, html } = tplDeadlineD1(base)
    expect(subject).toContain('JUTRO')
    expect(html).toContain('#dc2626')
  })

  it('D0 zawiera "DZIŚ"', () => {
    const { subject, html } = tplDeadlineD0(base)
    expect(subject).toContain('DZIŚ')
    expect(html).toContain('Termin upływa DZISIAJ')
  })
})

describe('email templates — welcome', () => {
  it('zawiera spersonalizowane powitanie', () => {
    const { subject, html } = tplWelcome({
      recipientName: 'Anna Nowak',
      recipientEmail: 'anna@example.pl',
    })
    expect(subject).toContain('Mandatomat')
    expect(html).toContain('Anna')
    expect(html).toContain('Stwórz pierwsze pismo')
  })

  it('działa bez imienia (anonimowe)', () => {
    const { html } = tplWelcome({ recipientEmail: 'x@y.pl' })
    expect(html).toContain('Witaj!')
  })
})

describe('email templates — payment success', () => {
  it('formatuje kwotę z przecinkiem dziesiętnym (PL)', () => {
    const { html } = tplPaymentSuccess({
      caseTitle: 'Sprzeciw od mandatu',
      caseId: 'abc-123',
      amountPln: 49.99,
    })
    expect(html).toContain('49,99 zł')
  })
})

describe('email templates — password reset', () => {
  it('zawiera link reset i ostrzeżenie o ignorowaniu', () => {
    const { subject, html } = tplPasswordReset({
      recipientName: 'Jan',
      resetUrl: 'https://mandatomat.pl/reset?token=abc123',
      ttlLabel: '60 minut',
    })
    expect(subject).toContain('Resetowanie hasła')
    expect(html).toContain('https://mandatomat.pl/reset?token=abc123')
    expect(html).toContain('60 minut')
    expect(html).toContain('Nie zlecałeś')
  })

  it('eskejpuje znaki specjalne w resetUrl', () => {
    const { html } = tplPasswordReset({
      resetUrl: 'https://mandatomat.pl/reset?t=a&b=1',
    })
    // href atrybut: & musi być zachowane jako &amp;
    expect(html).toContain('a&amp;b=1')
  })
})

describe('email templates — document ready', () => {
  it('zawiera typ pisma i CTA', () => {
    const { subject, html } = tplDocumentReady({
      recipientName: 'Anna',
      caseTitle: 'Sprzeciw od mandatu prędkościowego',
      caseId: 'case-1',
      documentType: 'Sprzeciw od wyroku nakazowego',
      pageCount: 3,
      generatedAt: new Date('2026-05-10'),
    })
    expect(subject).toContain('Sprzeciw od mandatu')
    expect(html).toContain('Sprzeciw od wyroku nakazowego')
    expect(html).toContain('3 stron')
    expect(html).toContain('Otwórz pismo')
  })

  it('liczba pojedyncza dla pageCount=1', () => {
    const { html } = tplDocumentReady({
      caseTitle: 't', caseId: 'c', documentType: 'd', pageCount: 1,
    })
    expect(html).toContain('1 strona')
  })
})

describe('email templates — invoice', () => {
  it('renderuje numer, datę i kwotę', () => {
    const { subject, html } = tplInvoice({
      invoiceNumber: 'FV/2026/05/0001',
      invoiceDate: new Date('2026-05-10'),
      amountPln: 99.5,
      caseTitle: 'Mandat',
      invoiceUrl: 'https://mandatomat.pl/inv/abc.pdf',
    })
    expect(subject).toContain('FV/2026/05/0001')
    expect(html).toContain('99,50 zł')
    expect(html).toContain('https://mandatomat.pl/inv/abc.pdf')
    expect(html).toContain('10 maja 2026')
  })

  it('działa jako paragon', () => {
    const { subject, html } = tplInvoice({
      invoiceNumber: 'PAR/0001',
      invoiceDate: new Date('2026-05-10'),
      amountPln: 49,
      invoiceUrl: 'https://x',
      documentKind: 'paragon',
    })
    expect(subject).toContain('Paragon')
    expect(html).toContain('Paragon')
  })
})

describe('renderTemplate — dispatcher', () => {
  it('routuje do welcome', () => {
    const r = renderTemplate({
      name: 'welcome',
      data: { recipientEmail: 'x@y.pl' },
    })
    expect(r.subject).toContain('Mandatomat')
  })

  it('routuje do password-reset', () => {
    const r = renderTemplate({
      name: 'password-reset',
      data: { resetUrl: 'https://x' },
    })
    expect(r.subject).toContain('Resetowanie')
  })

  it('routuje do invoice', () => {
    const r = renderTemplate({
      name: 'invoice',
      data: {
        invoiceNumber: 'FV/1',
        invoiceDate: new Date(),
        amountPln: 10,
        invoiceUrl: 'https://x',
      },
    })
    expect(r.subject).toContain('FV/1')
  })
})
