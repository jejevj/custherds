import { api } from './api'

export interface Booking {
  id: string
  booking_code: string
  guide_id: string
  vendor_id: string
  product_id: string | null
  booking_date: string
  booking_time: string | null
  pax_count: number
  tourist_names: string[] | null
  tourist_nationality: string | null
  notes: string | null
  status: string
  vendor_approval_at: string | null
  vendor_rejection_reason: string | null
  created_at: string
}

export interface BookingCreate {
  vendor_id: string
  product_id?: string
  booking_date: string
  booking_time?: string
  pax_count: number
  tourist_names?: string[]
  tourist_nationality?: string
  notes?: string
}

export const bookingsService = {
  list: () => api.get<Booking[]>('/bookings'),
  get: (id: string) => api.get<Booking>(`/bookings/${id}`),
  create: (payload: BookingCreate) => api.post<Booking>('/bookings', payload),
  approve: (id: string, action: 'approve' | 'reject', rejection_reason?: string) =>
    api.post<Booking>(`/bookings/${id}/approve`, { action, rejection_reason }),
}
