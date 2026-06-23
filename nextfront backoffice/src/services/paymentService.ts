/**
 * Payment Service — wraps Xendit invoice creation endpoint
 * Base URL: https://api-custherds.ourtestcloud.my.id
 * POST /api/v1/payments/invoice
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-custherds.ourtestcloud.my.id'

export interface CreateInvoicePayload {
  amount: number
  payer_email: string
  description: string
  external_id?: string
  currency?: string
  success_redirect_url?: string
  failure_redirect_url?: string
}

export interface InvoiceResponse {
  status: string
  invoice_id: string
  external_id: string
  invoice_url: string
  amount: number
  currency: string
  expiry_date: string | null
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
  const res = await fetch(`${API_BASE}/api/v1/payments/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json() as Promise<InvoiceResponse>
}
