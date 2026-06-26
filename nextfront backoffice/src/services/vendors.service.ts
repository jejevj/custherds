import { api } from './api'
import { Vendor } from '@/types/vendor.types'

export const getVendors = (): Promise<Vendor[]> =>
  api.get('/vendors')

export const getVendor = (id: string): Promise<Vendor> =>
  api.get(`/vendors/${id}`)

export const approveVendor = (
  vendorId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<{ message: string }> =>
  api.put(`/admin/vendors/${vendorId}/approve`, null, {
    params: { action, ...(notes ? { notes } : {}) },
  })
