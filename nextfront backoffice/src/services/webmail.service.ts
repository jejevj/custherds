import api from './api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmailConfig {
  id: number
  name: string
  provider: string
  host: string
  port: number
  use_tls: boolean
  username: string
  from_address: string
  from_name?: string
  is_default: boolean
  is_active: boolean
}

export interface SendEmailPayload {
  config_id: number
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body_html?: string
  body_text?: string
  reply_to_id?: number
}

export interface SendEmailResponse {
  success: boolean
  message_id?: string
  queued?: boolean
  detail?: string
}

export interface EmailMessage {
  id: number
  message_id: string
  from_address: string
  from_name?: string
  to_addresses: string[]
  subject: string
  folder: string
  is_read: boolean
  is_starred: boolean
  received_at?: string
  created_at: string
  has_attachments: boolean
}

export interface PaginatedEmailMessages {
  items: EmailMessage[]
  total: number
  page: number
  per_page: number
  pages: number
}

// Grup penerima
export interface RecipientUser {
  id: number
  email: string
  full_name?: string
  role: 'guide' | 'vendor' | 'user' | 'admin'
}

export type RecipientGroup = 'guides' | 'vendors' | 'all' | 'custom'

// ── Service ───────────────────────────────────────────────────────────────────

export const webmailService = {
  // Konfigurasi SMTP
  listConfigs: (): Promise<EmailConfig[]> =>
    api.get('/webmail/configs').then(r => r.data),

  createConfig: (data: Partial<EmailConfig> & { password: string }): Promise<EmailConfig> =>
    api.post('/webmail/configs', data).then(r => r.data),

  updateConfig: (id: number, data: Partial<EmailConfig> & { password?: string }): Promise<EmailConfig> =>
    api.put(`/webmail/configs/${id}`, data).then(r => r.data),

  deleteConfig: (id: number): Promise<void> =>
    api.delete(`/webmail/configs/${id}`),

  testConfig: (config_id: number, send_to: string) =>
    api.post('/webmail/configs/test', { config_id, send_to }).then(r => r.data),

  // Email
  // FIX: endpoint yang benar adalah /webmail/emails/send — bukan /webmail/send
  sendEmail: (payload: SendEmailPayload): Promise<SendEmailResponse> =>
    api.post('/webmail/emails/send', payload).then(r => r.data),

  listEmails: (folder = 'inbox', page = 1, per_page = 20): Promise<PaginatedEmailMessages> =>
    api.get('/webmail/emails', { params: { folder, page, per_page } }).then(r => r.data),

  getEmail: (id: number): Promise<EmailMessage> =>
    api.get(`/webmail/emails/${id}`).then(r => r.data),

  markRead: (id: number, is_read: boolean) =>
    api.patch(`/webmail/emails/${id}/read`, { is_read }).then(r => r.data),

  markStarred: (id: number, is_starred: boolean) =>
    api.patch(`/webmail/emails/${id}/star`, { is_starred }).then(r => r.data),

  moveFolder: (id: number, folder: string) =>
    api.patch(`/webmail/emails/${id}/move`, { folder }).then(r => r.data),

  deleteEmail: (id: number): Promise<void> =>
    api.delete(`/webmail/emails/${id}`),

  // ── Ambil daftar penerima per grup ─────────────────────────────────────────
  // Menggunakan endpoint /guides dan /vendors yang sudah ada
  listGuides: (): Promise<RecipientUser[]> =>
    api.get('/guides', { params: { per_page: 500, page: 1 } }).then(r => {
      const items = r.data?.items ?? r.data ?? []
      return items.map((g: any) => ({
        id: g.id,
        email: g.user?.email ?? g.email ?? '',
        full_name: g.user?.full_name ?? g.full_name ?? g.name ?? '',
        role: 'guide' as const,
      })).filter((u: RecipientUser) => !!u.email)
    }),

  listVendors: (): Promise<RecipientUser[]> =>
    api.get('/vendors', { params: { per_page: 500, page: 1 } }).then(r => {
      const items = r.data?.items ?? r.data ?? []
      return items.map((v: any) => ({
        id: v.id,
        email: v.user?.email ?? v.email ?? '',
        full_name: v.user?.full_name ?? v.full_name ?? v.vendor_business_name ?? '',
        role: 'vendor' as const,
      })).filter((u: RecipientUser) => !!u.email)
    }),
}
