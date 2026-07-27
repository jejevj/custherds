import { api } from './api'

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

/** Payload untuk create / update konfigurasi SMTP */
export interface EmailConfigPayload {
  name: string
  provider: string
  host: string
  port: number
  use_tls?: boolean
  username: string
  /** Wajib saat create; opsional saat update (kosongkan = tidak diubah) */
  password?: string
  from_address: string
  from_name?: string
  is_default?: boolean
  is_active?: boolean
}

/** Payload untuk endpoint test konfigurasi SMTP */
export interface TestEmailConfigPayload {
  config_id: number
  send_to: string
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

export interface EmailAttachment {
  id: number
  filename: string
  content_type: string
  size: number
  url: string
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
  body_html?: string
  body_text?: string
  attachments: EmailAttachment[]
}

export interface PaginatedEmailMessages {
  items: EmailMessage[]
  total: number
  page: number
  per_page: number
  pages: number
}

/** Parameter untuk listEmails */
export interface ListEmailsParams {
  folder?: string
  page?: number
  per_page?: number
  search?: string
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
    api.get<EmailConfig[]>('/webmail/configs').then(r => r),

  createConfig: (data: EmailConfigPayload): Promise<EmailConfig> =>
    api.post<EmailConfig>('/webmail/configs', data).then(r => r),

  updateConfig: (id: number, data: Partial<EmailConfigPayload>): Promise<EmailConfig> =>
    api.put<EmailConfig>(`/webmail/configs/${id}`, data).then(r => r),

  deleteConfig: (id: number): Promise<void> =>
    api.delete<void>(`/webmail/configs/${id}`),

  testConfig: ({ config_id, send_to }: TestEmailConfigPayload) =>
    api.post('/webmail/configs/test', { config_id, send_to }).then(r => r),

  // Email
  sendEmail: (payload: SendEmailPayload): Promise<SendEmailResponse> =>
    api.post<SendEmailResponse>('/webmail/emails/send', payload).then(r => r),

  listEmails: (params: ListEmailsParams = {}): Promise<PaginatedEmailMessages> => {
    const { folder = 'inbox', page = 1, per_page = 20, search } = params
    return api.get<PaginatedEmailMessages>('/webmail/emails', {
      params: { folder, page, per_page, ...(search ? { search } : {}) },
    }).then(r => r)
  },

  getEmail: (id: number): Promise<EmailMessage> =>
    api.get<EmailMessage>(`/webmail/emails/${id}`).then(r => r),

  markRead: (id: number, is_read: boolean): Promise<EmailMessage> =>
    api.patch<EmailMessage>(`/webmail/emails/${id}/read`, { is_read }).then(r => r),

  markStarred: (id: number, is_starred: boolean): Promise<EmailMessage> =>
    api.patch<EmailMessage>(`/webmail/emails/${id}/star`, { is_starred }).then(r => r),

  moveFolder: (id: number, folder: string): Promise<EmailMessage> =>
    api.patch<EmailMessage>(`/webmail/emails/${id}/move`, { folder }).then(r => r),

  deleteEmail: (id: number): Promise<void> =>
    api.delete<void>(`/webmail/emails/${id}`),

  // ── Ambil daftar penerima per grup ────────────────────────────────────────
  listGuides: (): Promise<RecipientUser[]> =>
    api.get<any>('/guides', { params: { per_page: 500, page: 1 } }).then(r => {
      const items = (r as any)?.items ?? r ?? []
      return (items as any[]).map((g: any) => ({
        id: g.id,
        email: g.user?.email ?? g.email ?? '',
        full_name: g.user?.full_name ?? g.full_name ?? g.name ?? '',
        role: 'guide' as const,
      })).filter((u: RecipientUser) => !!u.email)
    }),

  listVendors: (): Promise<RecipientUser[]> =>
    api.get<any>('/vendors', { params: { per_page: 500, page: 1 } }).then(r => {
      const items = (r as any)?.items ?? r ?? []
      return (items as any[]).map((v: any) => ({
        id: v.id,
        email: v.user?.email ?? v.email ?? '',
        full_name: v.user?.full_name ?? v.full_name ?? v.vendor_business_name ?? '',
        role: 'vendor' as const,
      })).filter((u: RecipientUser) => !!u.email)
    }),
}
