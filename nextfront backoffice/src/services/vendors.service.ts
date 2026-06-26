import { api } from './api'

export interface VendorProfile {
  id: string
  user_id: string
  vendor_name: string
  vendor_description: string | null
  vendor_phone: string | null
  vendor_address: string | null
  vendor_status: string
  deposit_balance: string
  approval_notes: string | null
  created_at: string
}

export interface VendorDepositInfo {
  deposit_balance: string
}

export const vendorsService = {
  getProfile: () => api.get<VendorProfile>('/vendors/me'),
  updateProfile: (payload: Partial<VendorProfile>) => api.put<VendorProfile>('/vendors/me', payload),
  getDeposit: () => api.get<VendorDepositInfo>('/vendors/me/deposit'),
}
