import { api } from './api'

export interface BookingReport {
  id: string
  report_code: string
  booking_id: string
  guide_id: string
  transaction_id: string | null
  report_type: string
  description: string
  status: string
  resolution_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  booking?: {
    id: string
    booking_code: string
    booking_date: string
    status: string
    vendor_id: string
    vendor_rejection_reason?: string
  } | null
  transaction?: {
    id: string
    transaction_code: string
    gross_amount: string
    guide_commission: string
    status: string
    receipt_image?: string
    submitted_at?: string
  } | null
  /** Email guide pelapor — di-populate backend dari guide.user.email */
  guide_email?: string | null
  /** Nama guide pelapor — di-populate backend dari guide.user.full_name */
  guide_name?: string | null
}

export const REPORT_TYPE_LABEL: Record<string, string> = {
  transaction_dispute: 'Sengketa Transaksi',
  unfair_rejection:    'Penolakan Tidak Wajar',
}

export const REPORT_STATUS_LABEL: Record<string, string> = {
  open:       'Open',
  in_review:  'Sedang Ditinjau',
  resolved:   'Selesai',
  dismissed:  'Ditolak',
}

export const REPORT_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open:       'secondary',
  in_review:  'default',
  resolved:   'outline',
  dismissed:  'destructive',
}

export const bookingReportsService = {
  /** Guide: buat laporan baru */
  create: (payload: { booking_id: string; description: string }) =>
    api.post<BookingReport>('/reports', payload),

  /** Guide: list laporan milik sendiri */
  listMine: () => api.get<BookingReport[]>('/reports'),

  /** Guide: detail laporan milik sendiri */
  get: (id: string) => api.get<BookingReport>(`/reports/${id}`),

  /** Guide: hapus laporan (hanya status open) */
  delete: (id: string) => api.delete<void>(`/reports/${id}`),
}
