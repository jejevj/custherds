import { api } from './api'

export interface GuideProfile {
  id: string
  user_id: string
  guide_status: string            // 'incomplete' | 'pending' | 'approved' | 'rejected'
  rejection_notes: string | null
  guide_nationality: string | null
  guide_phone: string | null
  guide_id_card_url: string | null
  guide_certificate: string | null
  guide_certificate_status: string
  bio: string | null
  languages: string | null
  rating: number | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  wallet_balance: string
  created_at: string
}

export interface GuideWallet {
  wallet_balance: string
  pending_earnings: string
  total_earnings: string
}

export const guidesService = {
  getProfile:    ()                               => api.get<GuideProfile>('/guides/me'),
  updateProfile: (payload: Partial<GuideProfile>) => api.put<GuideProfile>('/guides/me', payload),
  submitReview:  (payload: Partial<GuideProfile>) => api.post<GuideProfile>('/guides/me/submit', payload),
  getWallet:     ()                               => api.get<GuideWallet>('/guides/me/wallet'),
}
