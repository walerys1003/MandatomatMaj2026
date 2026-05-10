/**
 * Supabase database types — generated manually from SQL migrations
 * (supabase/migrations/*.sql).
 *
 * To regenerate from a live database, run:
 *   supabase gen types typescript --local > packages/db-types/src/database.types.ts
 *
 * Until the local Supabase stack is running, this file is the source of
 * truth for TS types and matches the migration schema 1:1.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ───────────────────────────────────────────────────────────────────────────
// Enums (from migrations 002, 004, 005, 006, 007)
// ───────────────────────────────────────────────────────────────────────────

export type CaseCategoryEnum =
  | 'mandaty'
  | 'parking'
  | 'windykacja'
  | 'ubezpieczenia'
  | 'etoll'
  | 'kontrole'
  | 'techniczne'

export type CaseTypeEnum =
  // Mandaty (7)
  | 'mandat_sprzeciw_predkosc'
  | 'mandat_odmowa_przyjecia'
  | 'mandat_uchylenie_prawomocny'
  | 'mandat_odwolanie_straz'
  | 'mandat_odwolanie_itd'
  | 'mandat_odroczenie_raty'
  | 'mandat_uchylenie_punktow'
  // Parking (4)
  | 'parking_sprzeciw_prywatny'
  | 'parking_reklamacja_zdm'
  | 'parking_odwolanie_ztm'
  | 'parking_blad_identyfikacji'
  // Windykacja (5)
  | 'windykacja_odpowiedz_wezwanie'
  | 'windykacja_przedawnienie'
  | 'windykacja_sprzeciw_epu'
  | 'windykacja_usuniecie_krd_bik'
  | 'windykacja_skarga_rf'
  // Ubezpieczenia (3)
  | 'ubezpieczenie_odwolanie_decyzja'
  | 'ubezpieczenie_wezwanie_wyplata'
  | 'ubezpieczenie_skarga_rf'
  // e-TOLL (3)
  | 'etoll_odwolanie_kara'
  | 'etoll_reklamacja_podwojne'
  | 'etoll_anulowanie'
  // Kontrole (4)
  | 'kontrola_sprzeciw_zatrzymanie_pj'
  | 'kontrola_cofniecie_decyzji'
  | 'kontrola_weryfikacja_urzadzenia'
  | 'kontrola_korekta_punktow'
  // Techniczne (4)
  | 'techniczne_pelnomocnictwo'
  | 'techniczne_rodo_dostep'
  | 'techniczne_rodo_usuniecie'
  | 'techniczne_lista_zalacznikow'
  // Pakiety
  | 'scoring_szans'

export type CaseStatusEnum =
  | 'draft'
  | 'form_completed'
  | 'generating'
  | 'preview'
  | 'editing'
  | 'payment_pending'
  | 'paid'
  | 'downloaded'
  | 'sent'
  | 'waiting'
  | 'resolved'
  | 'archived'

export type DocumentTypeEnum =
  | 'draft_markdown'
  | 'final_pdf'
  | 'attachment'
  | 'ocr_source'
  | 'checklist'
  | 'instruction'

export type OcrStatusEnum = 'uploaded' | 'processing' | 'completed' | 'failed' | 'reviewed'

export type DeadlineStatusEnum =
  | 'active'
  | 'reminded_d5'
  | 'reminded_d3'
  | 'reminded_d1'
  | 'reminded_d0'
  | 'expired'
  | 'completed'
  | 'cancelled'

export type ReminderChannelEnum = 'email' | 'sms' | 'push'

export type PaymentTypeEnum = 'one_time' | 'package' | 'subscription' | 'addon'

export type PaymentStatusEnum =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'disputed'

export type EventTypeEnum =
  | 'case_created'
  | 'case_form_completed'
  | 'case_scoring_completed'
  | 'case_generation_started'
  | 'case_generation_completed'
  | 'case_generation_failed'
  | 'case_edited'
  | 'case_payment_completed'
  | 'case_pdf_downloaded'
  | 'case_sent'
  | 'case_resolved'
  | 'case_archived'
  | 'document_created'
  | 'document_edited'
  | 'document_version_created'
  | 'document_pdf_rendered'
  | 'upload_created'
  | 'ocr_started'
  | 'ocr_completed'
  | 'ocr_failed'
  | 'payment_initiated'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_refunded'
  | 'deadline_created'
  | 'deadline_reminder_sent'
  | 'deadline_expired'
  | 'deadline_completed'
  | 'user_registered'
  | 'user_onboarding_completed'
  | 'user_subscription_started'
  | 'user_subscription_cancelled'
  | 'user_welcomed'

// ───────────────────────────────────────────────────────────────────────────
// Row / Insert / Update helper builders
// ───────────────────────────────────────────────────────────────────────────

interface ProfilesRow {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  pesel: string | null
  pesel_encrypted: string | null
  // Adres — kanoniczny (z migracji 001) i aliasy używane w kodzie
  address_street: string | null
  address_city: string | null
  address_zip: string | null
  address_postal_code: string | null
  street_address: string | null
  city: string | null
  postal_code: string | null
  tax_id: string | null
  // Preferencje
  notification_email: boolean | null
  notification_sms: boolean | null
  newsletter: boolean | null
  newsletter_consent: boolean | null
  marketing_consent: boolean | null
  preferred_locale: string | null
  // Subskrypcja — kanoniczny + aliasy
  subscription_plan: 'free' | 'kierowca' | 'pro' | null
  subscription_tier: string | null
  subscription_status: string | null
  subscription_stripe_id: string | null
  subscription_ends_at: string | null
  documents_this_month: number | null
  documents_limit: number | null
  monthly_quota_remaining: number | null
  // Meta
  role: 'user' | 'admin' | 'moderator' | null
  plan: string | null
  onboarding_completed: boolean | null
  referral_code: string | null
  referred_by: string | null
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

interface CasesRow {
  id: string
  user_id: string
  category: CaseCategoryEnum
  case_type: CaseTypeEnum
  title: string
  status: CaseStatusEnum | null
  priority: number | null
  form_data: Json
  ocr_data: Json
  scoring_result: Json | null
  parent_case_id: string | null
  payment_status: 'unpaid' | 'pending' | 'paid' | 'refunded' | 'free' | null
  stripe_payment_intent_id: string | null
  amount_paid: number | null
  deadline_date: string | null
  deadline_source: string | null
  is_demo: boolean | null
  // Aliasy używane w UI/API
  institution: string | null
  created_at: string | null
  updated_at: string | null
}

interface DocumentsRow {
  id: string
  case_id: string
  user_id: string
  doc_type: DocumentTypeEnum
  title: string
  content_markdown: string | null
  storage_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  version: number | null
  is_current: boolean | null
  parent_document_id: string | null
  ai_model_used: string | null
  ai_prompt_version: string | null
  ai_tokens_input: number | null
  ai_tokens_output: number | null
  ai_cost_usd: number | null
  score: number | null
  validation_passed: boolean | null
  validation_issues: Json | null
  created_at: string | null
  updated_at: string | null
}

interface UploadsRow {
  id: string
  case_id: string | null
  user_id: string
  document_id: string | null
  storage_path: string
  original_filename: string
  file_name: string | null
  file_path: string | null
  file_size: number
  mime_type: string
  ocr_status: OcrStatusEnum | null
  ocr_raw_text: string | null
  ocr_parsed_data: Json | null
  ocr_confidence: number | null
  ocr_error: string | null
  detected_fields: Json | null
  created_at: string | null
  updated_at: string | null
}

interface DeadlinesRow {
  id: string
  case_id: string | null
  user_id: string
  title: string
  description: string | null
  deadline_date: string
  remind_days: number[] | null
  status: DeadlineStatusEnum | null
  source: string | null
  legal_basis: string | null
  created_at: string | null
  updated_at: string | null
}

interface RemindersLogRow {
  id: string
  deadline_id: string
  user_id: string
  channel: ReminderChannelEnum
  days_before: number
  sent_at: string | null
  status: 'sent' | 'delivered' | 'failed' | 'bounced' | null
  error: string | null
}

interface PaymentsRow {
  id: string
  user_id: string
  case_id: string | null
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  stripe_session_id: string | null
  stripe_invoice_id: string | null
  stripe_subscription_id: string | null
  amount: number
  currency: string | null
  payment_type: PaymentTypeEnum
  type: PaymentTypeEnum | string | null
  status: PaymentStatusEnum | null
  product_name: string
  product_code: string
  invoice_id: string | null
  invoice_url: string | null
  promo_code: string | null
  discount_percent: number | null
  original_amount: number | null
  plan: string | null
  metadata: Json
  created_at: string | null
  updated_at: string | null
}

interface PromoCodesRow {
  id: string
  code: string
  discount_percent: number
  max_uses: number | null
  current_uses: number | null
  valid_from: string | null
  valid_until: string | null
  applicable_products: string[] | null
  is_active: boolean | null
  created_at: string | null
}

interface EventsRow {
  id: string
  user_id: string
  case_id: string | null
  event_type: EventTypeEnum | string
  data: Json
  // Alias używany w niektórych endpointach
  metadata: Json
  payload: Json
  type: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string | null
}

interface CaseTypeConfigRow {
  id: string
  case_type: CaseTypeEnum
  category: CaseCategoryEnum
  display_name: string
  short_name: string
  description: string | null
  icon: string | null
  price_pln: number
  price_package_pln: number | null
  form_schema: Json
  default_deadline_days: number | null
  deadline_legal_basis: string | null
  remind_days: number[] | null
  prompt_file: string
  ai_model: string | null
  default_addressee_type: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  slug: string
  is_active: boolean | null
  sort_order: number | null
  popularity: number | null
  success_rate: number | null
  created_at: string | null
  updated_at: string | null
}

interface AdminLogsRow {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  old_data: Json | null
  new_data: Json | null
  created_at: string | null
}

interface DailyStatsRow {
  id: string
  date: string
  new_users: number | null
  active_users: number | null
  cases_created: number | null
  cases_paid: number | null
  cases_by_category: Json
  cases_by_type: Json
  revenue_total: number | null
  revenue_by_product: Json
  average_order_value: number | null
  scorings_completed: number | null
  scoring_to_purchase_rate: number | null
  ocr_processed: number | null
  ocr_success_rate: number | null
  ai_tokens_total: number | null
  ai_cost_total: number | null
  created_at: string | null
}

interface StripeEventsRow {
  id: string
  event_id: string
  event_type: string
  payload: Json
  processed_at: string | null
  processing_status: 'success' | 'failed' | 'skipped' | null
  error_message: string | null
}

interface PromptTemplatesRow {
  id: string
  case_type: CaseTypeEnum
  content: string
  version: number
  description: string | null
  model: string | null
  temperature: number | null
  max_tokens: number | null
  last_edited_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface PromptTemplateVersionsRow {
  id: string
  template_id: string
  case_type: CaseTypeEnum
  version: number
  content: string
  model: string | null
  temperature: number | null
  max_tokens: number | null
  edited_by: string | null
  edit_note: string | null
  created_at: string | null
}

export type FeedbackOutcomeEnum = 'success' | 'partial' | 'failure' | 'pending' | 'unknown'

interface FeedbackRow {
  id: string
  user_id: string
  case_id: string
  rating: number | null
  outcome: FeedbackOutcomeEnum | null
  comment: string | null
  created_at: string | null
}

// Generic helper: turn a Row interface into Insert (most fields optional thanks
// to defaults / nullable columns) and Update (all optional).
type RowToInsert<R> = {
  [K in keyof R]?: R[K]
} & {
  // user_id / case_id / required-without-default columns are set by callers; we
  // keep them optional here to match Supabase's permissive Insert typing — the
  // server enforces NOT NULL anyway.
}

type RowToUpdate<R> = Partial<R>

interface Table<R> {
  Row: R
  Insert: RowToInsert<R>
  Update: RowToUpdate<R>
}

// ───────────────────────────────────────────────────────────────────────────
// Database
// ───────────────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfilesRow>
      cases: Table<CasesRow>
      documents: Table<DocumentsRow>
      uploads: Table<UploadsRow>
      deadlines: Table<DeadlinesRow>
      reminders_log: Table<RemindersLogRow>
      payments: Table<PaymentsRow>
      promo_codes: Table<PromoCodesRow>
      events: Table<EventsRow>
      case_type_config: Table<CaseTypeConfigRow>
      admin_logs: Table<AdminLogsRow>
      daily_stats: Table<DailyStatsRow>
      stripe_events: Table<StripeEventsRow>
      prompt_templates: Table<PromptTemplatesRow>
      prompt_template_versions: Table<PromptTemplateVersionsRow>
      feedback: Table<FeedbackRow>
    }
    Views: Record<string, never>
    Functions: {
      validate_promo_code: {
        Args: { p_code: string }
        Returns: {
          valid: boolean
          discount_percent: number | null
          message: string | null
        }[]
      }
    }
    Enums: {
      case_category: CaseCategoryEnum
      case_type: CaseTypeEnum
      case_status: CaseStatusEnum
      document_type: DocumentTypeEnum
      ocr_status: OcrStatusEnum
      deadline_status: DeadlineStatusEnum
      reminder_channel: ReminderChannelEnum
      payment_type: PaymentTypeEnum
      payment_status_enum: PaymentStatusEnum
      event_type: EventTypeEnum
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
