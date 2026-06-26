import { api } from './api'

export interface AdminUser {
  id: string
  user_name: string
  user_email: string
  user_type: number
  is_active: boolean
  created_at: string
}

export interface AdminGuide {
  guide_id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string | null
  is_active: boolean
  guide_nationality: string | null
  guide_phone: string | null
  guide_id_card_url: string | null
  guide_certificate: string | null
  guide_certificate_status: string
  guide_status: string
  rejection_notes: string | null
  bio: string | null
  languages: string | null
  wallet_balance: string
  created_at: string
}

export interface AdminVendor {
  vendor_id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string | null
  is_active: boolean
  vendor_business_name: string | null
  vendor_category: string | null
  vendor_area: string | null
  vendor_location: string | null
  vendor_short_description: string | null
  vendor_opening_hours: string | null
  vendor_website: string | null
  vendor_npwp: string | null
  vendor_nib: string | null
  vendor_status: string
  approval_notes: string | null
  deposit_balance: string
  created_at: string
}

export interface AdminTransaction {
  id: string
  booking_id: string
  amount: string
  platform_fee: string
  vendor_share: string
  guide_share: string
  status: string
  created_at: string
}

export interface AdminWithdrawal {
  id: string
  guide_id: string
  amount: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  status: string
  notes: string | null
  xendit_disbursement_id: string | null
  created_at: string
}

export interface SplitConfig {
  id: string
  vendor_percent: number
  guide_percent: number
  platform_percent: number
  is_active: boolean
  notes: string | null
  effective_from: string
}

export const adminService = {
  // Users
  listUsers: (user_type?: number) =>
    api.get<AdminUser[]>('/admin/users', { params: user_type !== undefined ? { user_type } : {} }),

  toggleUser: (user_id: string, is_active: boolean) =>
    api.put<{ message: string }>(`/admin/users/${user_id}/activate`, null, { params: { is_active } }),

  // Guides
  listGuides: (guide_status?: string) =>
    api.get<AdminGuide[]>('/admin/guides', { params: guide_status ? { guide_status } : {} }),

  approveGuide: (guide_id: string, action: 'approve' | 'reject', notes?: string) =>
    api.put<{ message: string; guide_status: string; guide_certificate_status: string }>(
      `/admin/guides/${guide_id}/approve`,
      null,
      { params: { action, ...(notes ? { notes } : {}) } },
    ),

  // Vendors
  listVendors: (vendor_status?: string) =>
    api.get<AdminVendor[]>('/admin/vendors', { params: vendor_status ? { vendor_status } : {} }),

  approveVendor: (vendor_id: string, action: 'approve' | 'reject', notes?: string) =>
    api.put<{ message: string; vendor_status: string }>(
      `/admin/vendors/${vendor_id}/approve`,
      null,
      { params: { action, ...(notes ? { notes } : {}) } },
    ),

  // Transactions
  listTransactions: (status?: string) =>
    api.get<AdminTransaction[]>('/admin/transactions', { params: status ? { status } : {} }),

  // Withdrawals
  listWithdrawals: (status?: string) =>
    api.get<AdminWithdrawal[]>('/admin/withdrawals', { params: status ? { status } : {} }),

  disburseWithdrawal: (withdrawal_id: string) =>
    api.post<{ message: string; xendit_disbursement_id: string }>(
      `/admin/withdrawals/${withdrawal_id}/disburse`, {}
    ),

  processWithdrawal: (withdrawal_id: string, payload: { status: string; notes?: string; xendit_disbursement_id?: string }) =>
    api.put<{ message: string }>(`/admin/withdrawals/${withdrawal_id}/process`, payload),

  // Split Config
  listSplitConfigs: () => api.get<SplitConfig[]>('/admin/split-config'),

  createSplitConfig: (payload: { vendor_percent: number; guide_percent: number; platform_percent: number; notes?: string }) =>
    api.post<SplitConfig>('/admin/split-config', payload),
}
