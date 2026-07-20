import { api } from './api'
import type {
  SettlementBankAccount,
  SettlementBankAccountCreate,
  SettlementBankAccountUpdate,
  SBAListResponse,
} from '@/types/settlementBankAccount.types'

const BASE = '/settlement-bank-account/'

export const settlementBankAccountService = {
  list: (params?: { page?: number; size?: number; status?: string }) =>
    api.get<SBAListResponse>(BASE, { params }),

  getById: (id: string) =>
    api.get<SettlementBankAccount>(`${BASE}${id}`),

  create: (body: SettlementBankAccountCreate) =>
    api.post<SettlementBankAccount>(BASE, body),

  update: (id: string, body: SettlementBankAccountUpdate) =>
    api.put<SettlementBankAccount>(`${BASE}${id}`, body),

  /** Force sync status dari DOKU ke DB lokal */
  sync: (id: string) =>
    api.post<{ message: string; data: SettlementBankAccount }>(`${BASE}${id}/sync`, {}),
}
