import { api } from './api'

export interface Withdrawal {
  id: string
  guide_id: string
  amount: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  status: string
  notes: string | null
  xendit_disbursement_id: string | null
  created_at: string
}

export interface WithdrawalCreate {
  amount: number
  bank_name?: string
  bank_account_number?: string
  bank_account_name?: string
  notes?: string
}

export const withdrawalsService = {
  list: () => api.get<Withdrawal[]>('/withdrawals'),
  get: (id: string) => api.get<Withdrawal>(`/withdrawals/${id}`),
  create: (payload: WithdrawalCreate) => api.post<Withdrawal>('/withdrawals', payload),
}
