import { api } from './api'

export interface Package {
  id: string
  vendor_id: string
  name: string
  description: string | null
  price_per_pax: string
  min_pax: number
  max_pax: number | null
  duration_minutes: number | null
  available_days: string[] | null
  available_slots: string[] | null
  quota_per_slot: number
  terms: string | null
  notes: string | null
  photo_urls: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackageCreate {
  name: string
  description?: string
  price_per_pax: number
  min_pax: number           // required — selalu ada nilai default (1)
  max_pax: number | null    // required — null = tak terbatas
  duration_minutes: number | null
  available_days: string[]
  available_slots: string[]
  quota_per_slot: number
  terms?: string
  notes?: string
  photo_urls: string[]
}

export interface PackageUpdate extends Partial<PackageCreate> {
  is_active?: boolean
}

export const packagesService = {
  listMine:     ()                                    => api.get<Package[]>('/packages/my-packages'),
  getOne:       (id: string)                          => api.get<Package>(`/packages/my-packages/${id}`),
  create:       (payload: PackageCreate)              => api.post<Package>('/packages/my-packages', payload),
  update:       (id: string, payload: PackageUpdate)  => api.put<Package>(`/packages/my-packages/${id}`, payload),
  remove:       (id: string)                          => api.delete<{ message: string }>(`/packages/my-packages/${id}`),
  toggleActive: (id: string, is_active: boolean)      => api.put<Package>(`/packages/my-packages/${id}`, { is_active }),
}
