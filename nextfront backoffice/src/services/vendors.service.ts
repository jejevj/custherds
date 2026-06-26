import { api } from './api'

export interface VendorProfile {
  id: string
  user_id: string
  vendor_status: string           // 'incomplete' | 'pending' | 'approved' | 'rejected'
  rejection_notes?: string | null
  vendor_business_name: string | null
  vendor_short_description: string | null
  vendor_contact_person: string | null
  vendor_location: string | null
  vendor_website: string | null
  vendor_opening_hours: string | null
  vendor_area: string | null
  vendor_npwp: string | null
  vendor_nib: string | null
  vendor_owner_id_card_url: string | null
  rating: number | null
  wallet_balance: string
  created_at: string
}

export const vendorsService = {
  getProfile:    ()                                => api.get<VendorProfile>('/vendors/me'),
  updateProfile: (payload: Partial<VendorProfile>) => api.put<VendorProfile>('/vendors/me', payload),
  submitReview:  (payload: Partial<VendorProfile>) => api.post<VendorProfile>('/vendors/me/submit', payload),
}
