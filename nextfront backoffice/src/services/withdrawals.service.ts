import { api } from './api'
import { Withdrawal } from '@/types/withdrawal.types'

export const getWithdrawals = (status?: string): Promise<Withdrawal[]> =>
  api.get('/admin/withdrawals', { params: status ? { status } : undefined })

export const disburseWithdrawal = (id: string): Promise<{
  message: string
  withdrawal_id: string
  xendit_disbursement_id: string
  status: string
  amount: string
}> => api.post(`/admin/withdrawals/${id}/disburse`, {})

export const overrideWithdrawal = (
  id: string,
  payload: { status: string; notes?: string; xendit_disbursement_id?: string }
): Promise<{ message: string }> =>
  api.put(`/admin/withdrawals/${id}/process`, payload)
