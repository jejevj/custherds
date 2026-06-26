import { api } from './api'

export interface SplitConfig {
  id:               string
  vendor_percent:   number
  guide_percent:    number
  platform_percent: number
  is_active:        boolean
  notes:            string | null
  effective_from:   string
  created_at:       string
}

export const getSplitConfigs = (): Promise<SplitConfig[]> =>
  api.get('/admin/split-config')

export const createSplitConfig = (payload: {
  vendor_percent:   number
  guide_percent:    number
  platform_percent: number
  notes?:           string
}): Promise<SplitConfig> =>
  api.post('/admin/split-config', payload)
