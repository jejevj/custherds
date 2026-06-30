export interface PaymentGatewayConfig {
  id: number
  provider: string
  label: string
  is_active: boolean
  is_production: boolean
  notes: string | null
  updated_at: string | null
}

export interface PaymentGatewayConfigDetail extends PaymentGatewayConfig {
  credentials: Record<string, string>
  created_at: string | null
}

export interface PaymentGatewayConfigCreate {
  provider: string
  label: string
  is_production: boolean
  credentials: Record<string, string>
  notes?: string
}

export interface PaymentGatewayConfigUpdate {
  label?: string
  is_production?: boolean
  credentials?: Record<string, string>
  notes?: string
}

export interface PaymentGatewayActivateRequest {
  provider: string
}
