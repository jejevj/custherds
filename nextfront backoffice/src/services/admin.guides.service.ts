import { api } from './api'

export interface AdminGuideItem {
  guide_id:                 string
  user_id:                  string
  user_name:                string
  user_email:               string
  user_phone:               string | null
  is_active:                boolean
  guide_nationality:        string | null
  guide_phone:              string | null
  guide_id_card_url:        string | null
  guide_certificate:        string | null
  guide_certificate_status: string
  guide_status:             string
  rejection_notes:          string | null
  bio:                      string | null
  languages:                string | null
  wallet_balance:           string
  bank_name:                string | null
  bank_account_number:      string | null
  bank_account_name:        string | null
  bank_settlement_id:       string | null
  created_at:               string
}

export const adminGuidesService = {
  /** Ambil semua guide, opsional filter guide_status */
  list: (params?: { guide_status?: string }) =>
    api.get<AdminGuideItem[]>('/admin/guides', { params }),

  /** Set / clear bank_settlement_id — hanya admin */
  setBankSettlementId: (guideId: string, bank_settlement_id: string | null) =>
    api.put<{ id: string; bank_settlement_id: string | null }>(
      `/admin/guides/${guideId}/bank-settlement-id`,
      { bank_settlement_id },
    ),
}
