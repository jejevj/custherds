import { api } from './api'
import type {
  PaymentGatewayConfig,
  PaymentGatewayConfigDetail,
  PaymentGatewayConfigCreate,
  PaymentGatewayConfigUpdate,
} from '@/types/paymentGatewayConfig'

export interface GatewayTestResult {
  ok: boolean
  provider: string
  message: string
  http_status: number
  raw: Record<string, unknown>
}

const BASE = '/admin/payment-gateway-config'

export const paymentGatewayConfigService = {
  list: () =>
    api.get<PaymentGatewayConfig[]>(`${BASE}/`),

  getActive: () =>
    api.get<PaymentGatewayConfig>(`${BASE}/active`),

  getDetail: (provider: string) =>
    api.get<PaymentGatewayConfigDetail>(`${BASE}/${provider}`),

  create: (payload: PaymentGatewayConfigCreate) =>
    api.post<PaymentGatewayConfigDetail>(`${BASE}/`, payload),

  update: (provider: string, payload: PaymentGatewayConfigUpdate) =>
    api.put<PaymentGatewayConfigDetail>(`${BASE}/${provider}`, payload),

  activate: (provider: string) =>
    api.put<PaymentGatewayConfig>(`${BASE}/activate`, { provider }),

  testConnection: (provider: string) =>
    api.post<GatewayTestResult>(`${BASE}/${provider}/test`, {}),

  delete: (provider: string) =>
    api.delete<void>(`${BASE}/${provider}`),
}
