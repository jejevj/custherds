import { api } from './api'

export interface Booking {
  id: string
  booking_code: string
  guide_id: string
  vendor_id: string
  booking_type: string
  package_id: string | null
  package_price_snapshot: string | null
  subtotal_package: string | null
  /** NEW — direct booking: harga/pax snapshot */
  direct_price_snapshot: string | null
  /** NEW — direct booking: direct_price_snapshot × pax_count */
  subtotal_direct: string | null
  booking_date: string
  booking_time: string | null
  pax_count: number
  total_price: string | null
  estimated_commission: string | null
  tourist_names: string | null
  tourist_nationality: string | null
  notes: string | null
  status: string
  vendor_approval_at: string | null
  vendor_rejection_reason: string | null
  cancelled_by: string | null
  cancelled_reason: string | null
  cancelled_at: string | null
  checkin_at: string | null
  receipt_url: string | null
  receipt_uploaded_at: string | null
  completed_at: string | null
  tx_attempt: number
  tx_attempt_max: number
  created_at: string
  updated_at: string
}

export interface BookingCreate {
  vendor_id: string
  booking_type?: 'direct' | 'package'
  package_id?: string
  booking_date: string
  booking_time?: string
  pax_count: number
  tourist_names?: string
  tourist_nationality?: string
  notes?: string
  /** Direct booking: harga per pax yang disepakati */
  direct_price?: number
}

export const bookingsService = {
  list:   ()           => api.get<Booking[]>('/bookings'),
  get:    (id: string) => api.get<Booking>(`/bookings/${id}`),
  create: (payload: BookingCreate) => api.post<Booking>('/bookings', payload),

  approve: (id: string, action: 'approve' | 'reject', rejection_reason?: string) =>
    api.post<Booking>(`/bookings/${id}/approve`, { action, rejection_reason }),

  cancel: (id: string, reason: string) =>
    api.post<Booking>(`/bookings/${id}/cancel`, { reason }),

  checkin: (id: string, bookingCode: string) =>
    api.post<Booking>(`/bookings/${id}/checkin`, { booking_code: bookingCode }),

  complete: (id: string) =>
    api.post<Booking>(`/bookings/${id}/complete`, {}),
}
