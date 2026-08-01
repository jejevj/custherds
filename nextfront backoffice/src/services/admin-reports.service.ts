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
  /** Semua laporan — admin only. GET /admin/reports[?status=] */
  list: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : ''
    return api.get<BookingReport[]>(`/admin/reports${qs}`)
  },

  /** Detail satu laporan. GET /admin/reports/{id} */
  get: (id: string) => api.get<BookingReport>(`/admin/reports/${id}`),

  /** Update status + catatan resolusi. PATCH /admin/reports/{id} */
  update: (id: string, payload: AdminReportUpdate) =>
    api.patch<BookingReport>(`/admin/reports/${id}`, payload),

  /** Kirim email terkait laporan via webmail. POST /webmail/emails/send */
  sendEmail: (payload: SendReportEmailPayload) =>
    api.post<{ success: boolean; detail?: string }>('/webmail/emails/send', {
      config_id: payload.config_id,
      to:        payload.to,
      cc:        payload.cc,
      subject:   payload.subject,
      body_html: payload.body_html,
      body_text: payload.body_text,
    }),
}
