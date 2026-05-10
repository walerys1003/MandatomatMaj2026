/**
 * Notifications barrel — public API.
 *
 * Użycie:
 *   import { sendEmail, renderTemplate } from '@/lib/notifications'
 *   const { subject, html } = renderTemplate({ name: 'welcome', data: { ... } })
 *   await sendEmail({ to: user.email, subject, html })
 */

export { sendEmail, EmailError } from './email'
export type { SendEmailInput, SendEmailResult } from './email'

export {
  tplDeadlineD5,
  tplDeadlineD3,
  tplDeadlineD1,
  tplDeadlineD0,
  tplWelcome,
  tplPaymentSuccess,
  tplPasswordReset,
  tplDocumentReady,
  tplInvoice,
  renderTemplate,
} from './templates'

export type {
  DeadlineTemplateData,
  WelcomeTemplateData,
  PaymentSuccessTemplateData,
  PasswordResetTemplateData,
  DocumentReadyTemplateData,
  InvoiceTemplateData,
  TemplateName,
  TemplateData,
} from './templates'
