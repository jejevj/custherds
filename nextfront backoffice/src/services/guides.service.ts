import { api } from './api'

export interface GuideProfile {
  id: string
  user_id: string
  guide_name: string
  guide_bio: string | null
  guide_phone: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  wallet_balance: string
  is_verified: boolean
  created_at: string
}

export interface GuideWallet {
  wallet_balance: string
}

export const guidesService = {
  getProfile: () => api.get<GuideProfile>('/guides/me'),
  updateProfile: (payload: Partial<GuideProfile>) => api.put<GuideProfile>('/guides/me', payload),
  getWallet: () => api.get<GuideWallet>('/guides/me/wallet'),
}
