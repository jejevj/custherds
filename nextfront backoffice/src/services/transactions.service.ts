import { api } from './api'

export interface Transaction {
  id: string
  booking_id: string
  amount: string
  platform_fee: string
  vendor_share: string
  guide_share: string
  status: string
  xendit_payment_id: string | null
  created_at: string
}

export const transactionsService = {
  list: (status?: string) =>
    api.get<Transaction[]>('/transactions', { params: status ? { status } : {} }),
  get: (id: string) => api.get<Transaction>(`/transactions/${id}`),
}
