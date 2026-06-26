import { api } from './api'

export interface VendorProfile {
  id: string
  vendor_status: string           // 'incomplete' | 'pending' | 'approved' | 'rejected'
  approval_notes: string | null
  vendor_business_name: string
  vendor_category: number
  vendor_area: number
  vendor_npwp: string | null
  vendor_nib: string | null
  vendor_owner_id_card_url: string | null
  vendor_location: string | null
  vendor_contact_person: string | null
  vendor_website: string | null
  vendor_short_description: string | null
  vendor_opening_hours: string | null
  vendor_min_spend: string | null
  vendor_cashback_percent: number
  deposit_balance: string
  created_at: string
}

export interface VendorDepositInfo {
  deposit_balance: string
}

export interface VendorSubmitPayload {
  vendor_business_name: string
  vendor_location: string
  vendor_contact_person: string
  vendor_npwp: string
  vendor_nib: string
  vendor_owner_id_card_url: string
  vendor_short_description: string
}

export const vendorsService = {
  getProfile:    ()                               => api.get<VendorProfile>('/vendors/me'),
  updateProfile: (payload: Partial<VendorProfile>) => api.put<VendorProfile>('/vendors/me', payload),
  submitReview:  (payload: VendorSubmitPayload)   => api.post<VendorProfile>('/vendors/me/submit', payload),
  getDeposit:    ()                               => api.get<VendorDepositInfo>('/vendors/me/deposit'),
}
