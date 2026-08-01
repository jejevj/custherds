import { api } from './api'

export type ReportType =
  | 'transaction_dispute'
  | 'unfair_rejection'
  | 'payment_issue'
  | 'vendor_misconduct'
  | 'service_issue'
  | 'documentation_issue'
  | 'other'

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  transaction_dispute: 'Dispute Transaksi',
  unfair_rejection:    'Penolakan Tidak Wajar',
  payment_issue:       'Masalah Pembayaran',
  vendor_misconduct:   'Perilaku Vendor Bermasalah',
  service_issue:       'Masalah Layanan',
  documentation_issue: 'Masalah Dokumentasi',
  other:               'Lainnya',
}

export const REPORT_STATUS_LABEL: Record<string, string> = {
  open:       'Menunggu Tinjauan',
  in_review:  'Sedang Ditinjau',
  resolved:   'Selesai',
  dismissed:  'Ditolak',
}

export const REPORT_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  open:      'secondary',
  in_review: 'default',
  resolved:  'default',
  dismissed: 'destructive',
}

export interface BookingBrief {
  id: string
  booking_code: string
  booking_date: string
  status: string
  vendor_id: string
  vendor_rejection_reason: string | null
}

export interface TransactionBrief {
  id: string
  transaction_code: string
  gross_amount: string
  guide_commission: string
  status: string
  receipt_image: string | null
  submitted_at: string | null
}

export interface BookingReport {
  id: string
  report_code: string
  booking_id: string
  guide_id: string
  transaction_id: string | null
  report_type: ReportType
  description: string
  status: string
  resolution_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  booking: BookingBrief | null
  transaction: TransactionBrief | null
}

export interface BookingReportCreate {
  booking_id: string
  description: string
}

export const bookingReportsService = {
  list:   ()         => api.get<BookingReport[]>(`/reports`),
  get:    (id: string) => api.get<BookingReport>(`/reports/${id}`),
  create: (payload: BookingReportCreate) => api.post<BookingReport>('/reports', payload),
  delete: (id: string) => api.delete<void>(`/reports/${id}`),
}
