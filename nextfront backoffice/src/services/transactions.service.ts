import { api } from './api'
import { Transaction } from '@/types/transaction.types'

export const getTransactions = (status?: string): Promise<Transaction[]> =>
  api.get('/admin/transactions', { params: status ? { status } : undefined })

export const getTransaction = (id: string): Promise<Transaction> =>
  api.get(`/transactions/${id}`)

export const approveTransaction = (
  id: string,
  payment_method: 'deposit' | 'pay_as_you_go'
) => api.post(`/transactions/${id}/approve`, { payment_method })

export const rejectTransaction = (id: string, reason: string) =>
  api.post(`/transactions/${id}/reject`, { reason })
