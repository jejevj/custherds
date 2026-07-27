import { api } from '@/services/api'

export interface VendorCategory {
  id:         number
  name:       string
  group_name: string
  sort_order: number
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface VendorCategoryCreate {
  name:       string
  group_name: string
  sort_order: number
  is_active:  boolean
}

export interface VendorCategoryUpdate {
  name?:       string
  group_name?: string
  sort_order?: number
  is_active?:  boolean
}

export const vendorCategoriesService = {
  list(params?: { group_name?: string; is_active?: boolean }): Promise<VendorCategory[]> {
    return api.get<VendorCategory[]>('/vendor-categories/', { params })
  },

  get(id: number): Promise<VendorCategory> {
    return api.get<VendorCategory>(`/vendor-categories/${id}`)
  },

  create(payload: VendorCategoryCreate): Promise<VendorCategory> {
    return api.post<VendorCategory>('/vendor-categories/', payload)
  },

  update(id: number, payload: VendorCategoryUpdate): Promise<VendorCategory> {
    return api.patch<VendorCategory>(`/vendor-categories/${id}`, payload)
  },

  delete(id: number): Promise<void> {
    return api.delete<void>(`/vendor-categories/${id}`)
  },
}
