import { api } from './api'

export type ReportType =
  | 'payment_issue'
  | 'vendor_misconduct'
  | 'service_issue'
  | 'documentation_issue'
  | 'other'

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  payment_issue:       'Masalah Pembayaran',
  vendor_misconduct:   'Perilaku Vendor Bermasalah',
  service_issue:       'Masalah Layanan',
  documentation_issue: 'Masalah Dokumentasi',
  other:               'Lainnya',
}

export interface BookingReport {
  id: string
  report_code: string
  booking_id: string
  guide_id: string
  transaction_id: string | null
  report_type: ReportType
  description: string
  status: 'open' | 'under_review' | 'resolved' | 'rejected'
  resolution_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface BookingReportCreate {
  booking_id: string
  report_type: ReportType
  description: string
}

export const bookingReportsService = {
  list: () => api.get<BookingReport[]>('/reports'),

  get: (id: string) => api.get<BookingReport>(`/reports/${id}`),

  create: (payload: BookingReportCreate) =>
    api.post<BookingReport>('/reports', payload),

  delete: (id: string) => api.delete<void>(`/reports/${id}`),
}
