/**
 * webmail.service.ts
 * Models & API calls untuk fitur Webmail (inbox, send email, email config)
 */
import api from '@/lib/axios'

// ─── Models ──────────────────────────────────────────────────────────────────

/** Satu pesan email di inbox */
export interface EmailMessage {
  id: number
  message_id: string          // RFC5322 Message-ID
  from_address: string
  from_name:    string | null
  to_addresses: string[]      // bisa lebih dari 1 penerima
  cc_addresses: string[]
  bcc_addresses: string[]
  subject:      string
  body_text:    string | null // plain-text version
  body_html:    string | null // HTML version
  is_read:      boolean
  is_starred:   boolean
  folder:       'inbox' | 'sent' | 'draft' | 'trash' | 'spam'
  attachments:  EmailAttachment[]
  received_at:  string        // ISO datetime
  created_at:   string
}

export interface EmailAttachment {
  id:        number
  filename:  string
  mime_type: string
  size:      number           // bytes
  url:       string
}

/** Payload untuk mengirim email */
export interface SendEmailPayload {
  to:       string[]          // wajib minimal 1
  cc?:      string[]
  bcc?:     string[]
  subject:  string
  body_html?: string
  body_text?: string
  reply_to_id?: number        // id EmailMessage jika reply
  config_id: number           // harus pakai config mana
}

/** Response dari send */
export interface SendEmailResponse {
  success:    boolean
  message_id: string          // RFC5322 id yang digenerate SMTP
  queued:     boolean         // true jika masuk queue, false jika langsung terkirim
}

/** Konfigurasi SMTP / email provider */
export interface EmailConfig {
  id:           number
  name:         string        // label, mis. "Gmail Custherds"
  provider:     'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'resend'
  host:         string | null // untuk SMTP
  port:         number | null
  use_tls:      boolean
  username:     string
  from_address: string
  from_name:    string | null
  is_default:   boolean
  is_active:    boolean
  created_at:   string
  updated_at:   string
}

/** Payload untuk create / update EmailConfig */
export interface EmailConfigPayload {
  name:         string
  provider:     EmailConfig['provider']
  host?:        string
  port?:        number
  use_tls?:     boolean
  username:     string
  password:     string        // hanya dikirim saat create/update, tidak pernah dikembalikan
  from_address: string
  from_name?:   string
  is_default?:  boolean
  is_active?:   boolean
}

/** Test connection payload */
export interface TestEmailConfigPayload {
  config_id:  number
  send_to:    string          // alamat penerima test
}

export interface TestEmailConfigResponse {
  success: boolean
  message: string
  latency_ms: number | null
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ListEmailsParams {
  folder?:   EmailMessage['folder']
  is_read?:  boolean
  search?:   string
  page?:     number
  per_page?: number
}

export interface PaginatedEmails {
  items:    EmailMessage[]
  total:    number
  page:     number
  per_page: number
  pages:    number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const webmailService = {
  // ── Inbox ──
  listEmails: (params?: ListEmailsParams): Promise<PaginatedEmails> =>
    api.get('/webmail/emails', { params }).then(r => r.data),

  getEmail: (id: number): Promise<EmailMessage> =>
    api.get(`/webmail/emails/${id}`).then(r => r.data),

  markRead: (id: number, is_read = true): Promise<EmailMessage> =>
    api.patch(`/webmail/emails/${id}/read`, { is_read }).then(r => r.data),

  markStarred: (id: number, is_starred: boolean): Promise<EmailMessage> =>
    api.patch(`/webmail/emails/${id}/star`, { is_starred }).then(r => r.data),

  moveFolder: (id: number, folder: EmailMessage['folder']): Promise<EmailMessage> =>
    api.patch(`/webmail/emails/${id}/folder`, { folder }).then(r => r.data),

  deleteEmail: (id: number): Promise<void> =>
    api.delete(`/webmail/emails/${id}`).then(() => undefined),

  // ── Send ──
  sendEmail: (payload: SendEmailPayload): Promise<SendEmailResponse> =>
    api.post('/webmail/send', payload).then(r => r.data),

  // ── Config ──
  listConfigs: (): Promise<EmailConfig[]> =>
    api.get('/webmail/configs').then(r => r.data),

  getConfig: (id: number): Promise<EmailConfig> =>
    api.get(`/webmail/configs/${id}`).then(r => r.data),

  createConfig: (payload: EmailConfigPayload): Promise<EmailConfig> =>
    api.post('/webmail/configs', payload).then(r => r.data),

  updateConfig: (id: number, payload: Partial<EmailConfigPayload>): Promise<EmailConfig> =>
    api.put(`/webmail/configs/${id}`, payload).then(r => r.data),

  deleteConfig: (id: number): Promise<void> =>
    api.delete(`/webmail/configs/${id}`).then(() => undefined),

  testConfig: (payload: TestEmailConfigPayload): Promise<TestEmailConfigResponse> =>
    api.post('/webmail/configs/test', payload).then(r => r.data),

  setDefault: (id: number): Promise<EmailConfig> =>
    api.patch(`/webmail/configs/${id}/default`).then(r => r.data),
}
