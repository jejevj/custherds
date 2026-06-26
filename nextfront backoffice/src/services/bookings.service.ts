import { api } from './api'
import { Booking } from '@/types/booking.types'

export const getBookings = (status?: string): Promise<Booking[]> =>
  api.get('/bookings', { params: status ? { status } : undefined })

export const getBooking = (id: string): Promise<Booking> =>
  api.get(`/bookings/${id}`)
