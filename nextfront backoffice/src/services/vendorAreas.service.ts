import { api } from '@/services/api'

// ─── Kabupaten ───────────────────────────────────────────────────────────────
export interface VendorAreaKabupaten {
  id:         number
  name:       string
  sort_order: number
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface VendorAreaKabupatenCreate {
  name:       string
  sort_order: number
  is_active:  boolean
}

export interface VendorAreaKabupatenUpdate {
  name?:       string
  sort_order?: number
  is_active?:  boolean
}

// ─── Kecamatan ───────────────────────────────────────────────────────────────
export interface VendorAreaKecamatan {
  id:           number
  kabupaten_id: number
  name:         string
  sort_order:   number
  is_active:    boolean
  created_at:   string
  updated_at:   string
}

export interface VendorAreaKecamatanCreate {
  kabupaten_id: number
  name:         string
  sort_order:   number
  is_active:    boolean
}

export interface VendorAreaKecamatanUpdate {
  name?:       string
  sort_order?: number
  is_active?:  boolean
}

// ─── Kelurahan ────────────────────────────────────────────────────────────────
export interface VendorAreaKelurahan {
  id:           number
  kecamatan_id: number
  name:         string
  sort_order:   number
  is_active:    boolean
  created_at:   string
  updated_at:   string
}

export interface VendorAreaKelurahanCreate {
  kecamatan_id: number
  name:         string
  sort_order:   number
  is_active:    boolean
}

export interface VendorAreaKelurahanUpdate {
  name?:       string
  sort_order?: number
  is_active?:  boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const vendorAreasService = {
  // Kabupaten
  listKabupaten(params?: { is_active?: boolean }): Promise<VendorAreaKabupaten[]> {
    return api.get<VendorAreaKabupaten[]>('/vendor-areas/kabupaten', { params })
  },
  createKabupaten(payload: VendorAreaKabupatenCreate): Promise<VendorAreaKabupaten> {
    return api.post<VendorAreaKabupaten>('/vendor-areas/kabupaten', payload)
  },
  updateKabupaten(id: number, payload: VendorAreaKabupatenUpdate): Promise<VendorAreaKabupaten> {
    return api.patch<VendorAreaKabupaten>(`/vendor-areas/kabupaten/${id}`, payload)
  },
  deleteKabupaten(id: number): Promise<void> {
    return api.delete<void>(`/vendor-areas/kabupaten/${id}`)
  },

  // Kecamatan
  listKecamatan(params?: { kabupaten_id?: number; is_active?: boolean }): Promise<VendorAreaKecamatan[]> {
    return api.get<VendorAreaKecamatan[]>('/vendor-areas/kecamatan', { params })
  },
  createKecamatan(payload: VendorAreaKecamatanCreate): Promise<VendorAreaKecamatan> {
    return api.post<VendorAreaKecamatan>('/vendor-areas/kecamatan', payload)
  },
  updateKecamatan(id: number, payload: VendorAreaKecamatanUpdate): Promise<VendorAreaKecamatan> {
    return api.patch<VendorAreaKecamatan>(`/vendor-areas/kecamatan/${id}`, payload)
  },
  deleteKecamatan(id: number): Promise<void> {
    return api.delete<void>(`/vendor-areas/kecamatan/${id}`)
  },

  // Kelurahan
  listKelurahan(params?: { kecamatan_id?: number; is_active?: boolean }): Promise<VendorAreaKelurahan[]> {
    return api.get<VendorAreaKelurahan[]>('/vendor-areas/kelurahan', { params })
  },
  createKelurahan(payload: VendorAreaKelurahanCreate): Promise<VendorAreaKelurahan> {
    return api.post<VendorAreaKelurahan>('/vendor-areas/kelurahan', payload)
  },
  updateKelurahan(id: number, payload: VendorAreaKelurahanUpdate): Promise<VendorAreaKelurahan> {
    return api.patch<VendorAreaKelurahan>(`/vendor-areas/kelurahan/${id}`, payload)
  },
  deleteKelurahan(id: number): Promise<void> {
    return api.delete<void>(`/vendor-areas/kelurahan/${id}`)
  },
}
