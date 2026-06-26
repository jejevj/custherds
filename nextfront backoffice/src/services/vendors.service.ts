import { api } from './api'
import { resolveUploadUrl } from './uploads.service'

// ── Vendor self-service types (vendor portal) ─────────────────────────

export interface VendorDepositInfo {
  id: string
  vendor_business_name: string
  deposit_balance: string
  deposit_minimum: string | null
}

export const vendorsService = {
  getDeposit: () => api.get<VendorDepositInfo>('/vendors/me/deposit'),
}

// ── Public browse types (guide portal) ──────────────────────────────

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
}

export function resolveCoverPhoto(url: string | null): string {
  if (!url) return ''
  return resolveUploadUrl(url)
}
