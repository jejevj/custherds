export type SBAStatus = 'pending_verification' | 'verified' | 'rejected' | 'inactive'

export interface SettlementBankAccount {
  id: string
  bank_code: string
  bank_name?: string
  account_number: string
  account_name: string
  merchant_reference?: string
  status: SBAStatus
  created_at: string
  updated_at: string
}

export interface SettlementBankAccountCreate {
  bank_code: string
  account_number: string
  account_name: string
  merchant_reference?: string
}

export interface SettlementBankAccountUpdate {
  account_name?: string
  merchant_reference?: string
}

export interface SBAListResponse {
  items: SettlementBankAccount[]
  total: number
  page: number
  size: number
}
