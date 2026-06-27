import { API_BASE_URL } from '@/lib/constants'
import { api } from './api'
import { getTokens } from './api'

export interface Transaction {
  id: string
  transaction_code: string
  booking_id: string
  vendor_id: string
  guide_id: string
  gross_amount: string
  extra_amount: string | null
  extra_notes: string | null
  receipt_image: string | null           // path API: /api/v1/uploads/<filename>
  receipt_notes: string | null
  vendor_percent_snapshot: string
  guide_percent_snapshot: string
  platform_percent_snapshot: string
  vendor_amount: string
  guide_commission: string
  platform_fee: string
  payment_method: string | null
  xendit_invoice_id: string | null
  xendit_invoice_url: string | null
  vendor_rejection_reason: string | null
  status: string
  vendor_reviewed_at: string | null
  paid_at: string | null
  settled_at: string | null
  created_at: string
  updated_at: string
}

export interface TransactionInvoiceResponse {
  transaction: Transaction
  payment_method: string
  invoice_url: string | null
  xendit_invoice_id: string | null
  message: string
}

/**
 * Resolve path relatif API ke full URL backend untuk serving file.
 * /api/v1/uploads/xxx.jpg → https://api.example.com/api/v1/uploads/xxx.jpg
 */
export function resolveReceiptUrl(path: string | null): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  return `${base}${path}`
}

export const transactionsService = {
  list: (status?: string) =>
    api.get<Transaction[]>('/transactions', { params: status ? { status } : {} }),

  get: (id: string) =>
    api.get<Transaction>(`/transactions/${id}`),

  /** Ambil transaksi by booking_id dari list */
  getByBookingId: async (bookingId: string): Promise<Transaction | null> => {
    const list = await api.get<Transaction[]>('/transactions')
    return list.find(t => t.booking_id === bookingId) ?? null
  },

  /**
   * Guide submit transaksi via multipart/form-data.
   * Endpoint: POST /bookings/{id}/submit-transaction
   * File di-upload langsung, tidak melalui /uploads terpisah.
   */
  submitTransaction: async (
    bookingId: string,
    params: {
      receiptFile: File
      grossAmount: number
      extraAmount?: number
      extraNotes?: string
      receiptNotes?: string
    }
  ): Promise<Transaction> => {
    const { access } = getTokens()
    const form = new FormData()
    form.append('receipt_file', params.receiptFile)
    form.append('gross_amount', String(params.grossAmount))
    if (params.extraAmount != null) form.append('extra_amount', String(params.extraAmount))
    if (params.extraNotes)  form.append('extra_notes',   params.extraNotes)
    if (params.receiptNotes) form.append('receipt_notes', params.receiptNotes)

    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/submit-transaction`, {
      method: 'POST',
      headers: access ? { Authorization: `Bearer ${access}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Submit gagal' }))
      throw err
    }
    return res.json() as Promise<Transaction>
  },

  /** Vendor approve transaksi */
  approve: (txId: string, paymentMethod: 'deposit' | 'pay_as_you_go') =>
    api.post<TransactionInvoiceResponse>(`/transactions/${txId}/approve`, { payment_method: paymentMethod }),

  /** Vendor reject transaksi */
  reject: (txId: string, reason?: string) =>
    api.post<Transaction>(`/transactions/${txId}/reject`, { reason }),

  /** Ambil ulang link pembayaran Xendit */
  getInvoiceUrl: (txId: string) =>
    api.get<TransactionInvoiceResponse>(`/transactions/${txId}/invoice-url`),
}
