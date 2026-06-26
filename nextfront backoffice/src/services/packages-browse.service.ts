import { api } from './api'

export interface PackageBrowse {
  id: string
  vendor_id: string
  vendor_name: string
  vendor_location: string | null
  vendor_allow_direct_booking: boolean
  name: string
  description: string | null
  price_per_pax: number
  commission_per_pax: number
  guide_percent: number
  min_pax: number
  max_pax: number | null
  duration_minutes: number | null
  available_days: string[]
  available_slots: string[]
  quota_per_slot: number
  terms: string | null
  photo_urls: string[]
  is_active: boolean
  created_at: string
}

export interface PackageBrowseParams {
  search?: string
  vendor_id?: string
  available_day?: string
  min_price?: number
  max_price?: number
  min_duration?: number
  max_duration?: number
  sort?: 'newest' | 'commission_desc' | 'price_asc' | 'price_desc'
  skip?: number
  limit?: number
}

const DAYS_ID: Record<string, string> = {
  Mon: 'Senin', Tue: 'Selasa', Wed: 'Rabu',
  Thu: 'Kamis', Fri: 'Jumat', Sat: 'Sabtu', Sun: 'Minggu',
}
export const DAY_OPTIONS = Object.entries(DAYS_ID).map(([v, l]) => ({ value: v, label: l }))

export const packagesBrowseService = {
  browse: (params: PackageBrowseParams = {}) => {
    const q = new URLSearchParams()
    if (params.search)          q.set('search', params.search)
    if (params.vendor_id)       q.set('vendor_id', params.vendor_id)
    if (params.available_day)   q.set('available_day', params.available_day)
    if (params.min_price != null) q.set('min_price', String(params.min_price))
    if (params.max_price != null) q.set('max_price', String(params.max_price))
    if (params.min_duration != null) q.set('min_duration', String(params.min_duration))
    if (params.max_duration != null) q.set('max_duration', String(params.max_duration))
    if (params.sort)            q.set('sort', params.sort)
    if (params.skip != null)    q.set('skip', String(params.skip))
    if (params.limit != null)   q.set('limit', String(params.limit))
    return api.get<PackageBrowse[]>(`/packages/browse?${q.toString()}`)
  },
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
