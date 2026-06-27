import { api } from './api'
import { resolveUploadUrl } from './uploads.service'

// ────────────────────────── VENDOR SELF-SERVICE ──────────────────────────

export interface VendorProfile {
  id: string
  vendor_status: string
  approval_notes: string | null
  rejection_notes: string | null
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
  allow_direct_booking: boolean
}

export interface VendorUpdatePayload {
  vendor_business_name?: string | null
  vendor_location?: string | null
  vendor_contact_person?: string | null
  vendor_website?: string | null
  vendor_short_description?: string | null
  vendor_opening_hours?: string | null
  vendor_min_spend?: string | null
  vendor_npwp?: string | null
  vendor_nib?: string | null
  vendor_owner_id_card_url?: string | null
  allow_direct_booking?: boolean
}

export interface VendorSubmitPayload {
  vendor_business_name?: string | null
  vendor_location?: string | null
  vendor_contact_person?: string | null
  vendor_npwp?: string | null
  vendor_nib?: string | null
  vendor_owner_id_card_url?: string | null
  vendor_short_description?: string | null
  vendor_opening_hours?: string | null
  vendor_website?: string | null
}

export interface VendorDepositInfo {
  id: string
  vendor_business_name: string
  deposit_balance: string
  deposit_minimum: string | null
}

export const vendorsService = {
  getProfile:    ()                              => api.get<VendorProfile>('/vendors/me'),
  updateProfile: (payload: VendorUpdatePayload) => api.put<VendorProfile>('/vendors/me', payload),
  submitReview:  (payload: VendorSubmitPayload) => api.post<VendorProfile>('/vendors/me/submit', payload),
  getDeposit:    ()                              => api.get<VendorDepositInfo>('/vendors/me/deposit'),
}

// ────────────────────────── GUIDE BROWSE ─────────────────────────────────

export interface VendorPublic {
  id: string
  vendor_business_name: string
  vendor_category: number
  vendor_area: number
  vendor_location: string | null
  vendor_short_description: string | null
  vendor_opening_hours: string | null
  vendor_min_spend: string | null
  vendor_cashback_percent: number
  vendor_website: string | null
  allow_direct_booking: boolean
  package_count: number
  max_commission_per_pax: number | null
  cover_photo: string | null
}

export interface PackagePublic {
  id: string
  package_name: string
  package_description: string | null
  price_per_pax: string
  min_pax: number | null
  max_pax: number | null
  duration_hours: number | null
  photo_urls: string[] | null
  is_active: boolean
  guide_commission_per_pax: number | null
}

export interface VendorDetail {
  id: string
  vendor_business_name: string
  vendor_category: number
  vendor_area: number
  vendor_location: string | null
  vendor_contact_person: string | null
  vendor_short_description: string | null
  vendor_opening_hours: string | null
  vendor_min_spend: string | null
  vendor_cashback_percent: number
  vendor_website: string | null
  allow_direct_booking: boolean
  cover_photo: string | null
  packages: PackagePublic[]
}

export interface VendorBrowseParams {
  search?: string
  area?: number
  category?: number
  allow_direct?: boolean
  sort?: 'name' | 'commission_desc' | 'packages_desc'
  skip?: number
  limit?: number
}

export const vendorsBrowseService = {
  browse: (params: VendorBrowseParams = {}) => {
    const q = new URLSearchParams()
    if (params.search)               q.set('search', params.search)
    if (params.area != null)         q.set('area', String(params.area))
    if (params.category != null)     q.set('category', String(params.category))
    if (params.allow_direct != null) q.set('allow_direct', String(params.allow_direct))
    if (params.sort)                 q.set('sort', params.sort)
    if (params.skip != null)         q.set('skip', String(params.skip))
    if (params.limit != null)        q.set('limit', String(params.limit))
    return api.get<VendorPublic[]>(`/vendors/browse?${q.toString()}`)
  },
  getDetail: (vendorId: string) =>
    api.get<VendorDetail>(`/vendors/browse/${vendorId}`),
}

export function resolveCoverPhoto(url: string | null): string {
  if (!url) return ''
  return resolveUploadUrl(url)
}
