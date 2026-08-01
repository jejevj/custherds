import { api } from './api'
import { BookingReport } from './booking-reports.service'

export interface AdminReportUpdate {
  status: 'in_review' | 'resolved' | 'dismissed'
  resolution_notes?: string
}

export interface SendReportEmailPayload {
  config_id: number
  report_code: string
  to: string[]
  cc?: string[]
  subject: string
  body_html: string
  body_text: string
}

export const adminReportsService = {
  /** Semua laporan — admin only */
  list: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : ''
    return api.get<BookingReport[]>(`/admin/reports${qs}`)
  },

  /** Detail satu laporan */
  get: (id: string) => api.get<BookingReport>(`/admin/reports/${id}`),

  /** Update status + catatan resolusi */
  update: (id: string, payload: AdminReportUpdate) =>
    api.patch<BookingReport>(`/admin/reports/${id}`, payload),

  /** Kirim email terkait laporan via webmail service */
  sendEmail: (payload: SendReportEmailPayload) =>
    api.post<{ success: boolean; detail?: string }>('/webmail/send', {
      config_id: payload.config_id,
      to:        payload.to,
      cc:        payload.cc,
      subject:   payload.subject,
      body_html: payload.body_html,
      body_text: payload.body_text,
    }),
}
