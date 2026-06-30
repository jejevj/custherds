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
  qris_string: string | null
  doku_reference_no: string | null
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

  /**
   * Ambil transaksi aktif (non-rejected) berdasarkan booking_id.
   * Jika tidak ada tx aktif, kembalikan tx rejected terbaru (untuk tampilkan foto lama saat revisi).
   */
  getByBookingId: async (bookingId: string): Promise<Transaction | null> => {
    const list = await api.get<Transaction[]>('/transactions')
    const byBooking = list.filter(t => t.booking_id === bookingId)
    if (byBooking.length === 0) return null
    // Prioritaskan tx aktif (non-rejected)
    const active = byBooking.find(t => t.status !== 'rejected')
    if (active) return active
    // Fallback: tx rejected terbaru (untuk tampilkan foto lama saat revisi)
    return byBooking.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  },

  /**
   * Guide submit transaksi via multipart/form-data.
   * Semua file dikirim sekaligus sebagai receipt_files[] ke satu endpoint.
   * Backend menyimpan file[0] sebagai receipt_image,
   * file[1..N] path-nya di-embed ke receipt_notes sebagai [extra_photos:[...]].
   */
  submitTransaction: async (
    bookingId: string,
    params: {
      receiptFiles: File[]      // semua file — minimal 1
      grossAmount: number
      extraAmount?: number
      extraNotes?: string
      receiptNotes?: string
    }
  ): Promise<Transaction> => {
    const { access } = getTokens()
    const form = new FormData()

    // Kirim semua file dengan key yang sama: receipt_files
    params.receiptFiles.forEach(f => form.append('receipt_files', f))

    form.append('gross_amount', String(params.grossAmount))
    if (params.extraAmount != null) form.append('extra_amount', String(params.extraAmount))
    if (params.extraNotes)   form.append('extra_notes',   params.extraNotes)
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

  /** Ambil ulang QRIS / link pembayaran aktif */
  getInvoiceUrl: (txId: string) =>
    api.get<TransactionInvoiceResponse>(`/transactions/${txId}/invoice-url`),
}
