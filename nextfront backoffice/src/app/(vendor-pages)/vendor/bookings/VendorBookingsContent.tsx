"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { transactionsService, Transaction, resolveReceiptUrl } from "@/services/transactions.service"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, CheckCircle, XCircle, CalendarDays, Users, FileText,
  Package, MapPin, Upload, CheckCircle2, Receipt, AlertCircle,
  CreditCard, Banknote,
} from "lucide-react"
import { useTableSearch } from "@/hooks/useTableSearch"
import { TableSearchInput } from "@/components/ui/TableSearchInput"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed:          "default",
  pending_vendor:     "secondary",
  pending_receipt:    "secondary",
  pending_completion: "secondary",
  completed:          "default",
  rejected:           "destructive",
  cancelled:          "destructive",
}

const STATUS_LABEL: Record<string, string> = {
  pending_vendor:     "Menunggu Approval",
  confirmed:          "Dikonfirmasi",
  pending_receipt:    "Checkin ✓ — Menunggu Transaksi Guide",
  pending_completion: "Perlu Review Transaksi",
  completed:          "Selesai",
  rejected:           "Ditolak",
  cancelled:          "Dibatalkan",
}

function formatRupiah(n?: number | string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

export default function VendorBookingsContent() {
  const params = useSearchParams()
  const status = params.get("status") ?? undefined

  const [bookings,   setBookings]   = useState<Booking[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")

  const { query, setQuery, filtered } = useTableSearch(bookings)

  const [detailBook,    setDetailBook]    = useState<Booking | null>(null)
  const [detailTx,      setDetailTx]      = useState<Transaction | null>(null)
  const [txLoading,     setTxLoading]     = useState(false)
  const [showReject,    setShowReject]     = useState(false)
  const [rejectReason,  setRejectReason]  = useState("")
  const [actionError,   setActionError]   = useState("")
  const [submitting,    setSubmitting]    = useState(false)

  // Transaksi action state
  const [showTxReject,  setShowTxReject]  = useState(false)
  const [txRejectReason, setTxRejectReason] = useState("")
  const [showPayMethod, setShowPayMethod] = useState(false)
  const [invoiceUrl,    setInvoiceUrl]    = useState<string | null>(null)

  useEffect(() => {
    bookingsService.list()
      .then(d => setBookings(status ? d.filter(b => b.status === status) : d))
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [status])

  const openDetail = async (b: Booking) => {
    setDetailBook(b)
    setDetailTx(null)
    setShowReject(false); setRejectReason(""); setActionError("")
    setShowTxReject(false); setTxRejectReason("")
    setShowPayMethod(false); setInvoiceUrl(null)

    // Jika ada transaksi (pending_completion / completed), fetch sekarang
    if (["pending_completion", "completed"].includes(b.status)) {
      setTxLoading(true)
      try {
        const tx = await transactionsService.getByBookingId(b.id)
        setDetailTx(tx)
      } catch { /* silent */ }
      finally { setTxLoading(false) }
    }
  }

  const closeDetail = () => {
    setDetailBook(null); setDetailTx(null)
    setShowReject(false); setShowTxReject(false)
    setShowPayMethod(false); setInvoiceUrl(null)
  }

  const handleApprove = async () => {
    if (!detailBook) return
    setSubmitting(true)
    try {
      const updated = await bookingsService.approve(detailBook.id, "approve")
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setDetailBook(updated)
    } catch { setActionError("Gagal approve booking. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!detailBook) return
    if (!rejectReason.trim()) { setActionError("Alasan penolakan wajib diisi."); return }
    setSubmitting(true)
    try {
      const updated = await bookingsService.approve(detailBook.id, "reject", rejectReason.trim())
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      closeDetail()
    } catch { setActionError("Gagal menolak booking. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  const handleCheckin = async () => {
    if (!detailBook) return
    setSubmitting(true)
    try {
      const updated = await bookingsService.checkin(detailBook.id)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setDetailBook(updated)
    } catch { setActionError("Gagal checkin. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  // ── Approve Transaksi (pilih metode bayar) ──
  const handleTxApprove = async (method: 'deposit' | 'pay_as_you_go') => {
    if (!detailTx) return
    setSubmitting(true)
    try {
      const result = await transactionsService.approve(detailTx.id, method)
      setDetailTx(result.transaction)
      if (result.invoice_url) setInvoiceUrl(result.invoice_url)
      // Refresh booking
      const updated = await bookingsService.get(detailTx.booking_id)
      setDetailBook(updated)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setShowPayMethod(false)
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail
      setActionError(detail ?? "Gagal approve transaksi.")
    } finally { setSubmitting(false) }
  }

  // ── Reject Transaksi ──
  const handleTxReject = async () => {
    if (!detailTx) return
    if (!txRejectReason.trim()) { setActionError("Alasan penolakan wajib diisi."); return }
    setSubmitting(true)
    try {
      await transactionsService.reject(detailTx.id, txRejectReason.trim())
      // Booking kembali ke confirmed — refetch
      const updated = await bookingsService.get(detailTx.booking_id)
      setDetailBook(updated)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setDetailTx(null); setShowTxReject(false)
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail
      setActionError(detail ?? "Gagal reject transaksi.")
    } finally { setSubmitting(false) }
  }

  const isPending      = detailBook?.status === "pending_vendor"
  const isConfirmed    = detailBook?.status === "confirmed"
  const isNeedTxReview = detailBook?.status === "pending_completion"
  const txPendingApproval = detailTx?.status === "pending_vendor_approval"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "pending_vendor"      ? "Bookings — Pending Approval"
          : status === "pending_completion" ? "Bookings — Perlu Review Transaksi"
          : "All Bookings"}
        </h1>
        <p className="text-muted-foreground">Booking dari guide untuk produk kamu.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <TableSearchInput value={query} onChange={setQuery} placeholder="Cari kode, tanggal, status..." />
        {query && (
          <p className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} dari {bookings.length} hasil</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                {query ? `Tidak ada hasil untuk "${query}"` : "Tidak ada data."}
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3 font-medium">{formatRupiah(b.total_price)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openDetail(b)}>
                    <Eye size={14} className="mr-1" /> Lihat Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailBook} onOpenChange={open => { if (!open) closeDetail() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} /> Detail Booking
              {detailBook && (
                <Badge variant={STATUS_VARIANT[detailBook.status] ?? "secondary"} className="ml-auto">
                  {STATUS_LABEL[detailBook.status] ?? detailBook.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {detailBook && (
            <div className="space-y-4 py-1">
              {/* Booking info */}
              <div className="rounded-lg border bg-muted/20 divide-y text-sm">
                <InfoRow icon={<FileText size={13}/>}     label="Kode Booking"  value={detailBook.booking_code} mono />
                <InfoRow icon={<CalendarDays size={13}/>} label="Tanggal"        value={new Date(detailBook.booking_date).toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />
                {detailBook.booking_time && <InfoRow label="Waktu" value={detailBook.booking_time} />}
                <InfoRow icon={<Users size={13}/>} label="Jumlah Pax" value={`${detailBook.pax_count} orang`} />
                {detailBook.tourist_nationality && <InfoRow label="Kewarganegaraan" value={detailBook.tourist_nationality} />}
                {detailBook.booking_type === "package" && detailBook.package_price_snapshot && (
                  <InfoRow icon={<Package size={13}/>} label="Harga / Pax" value={formatRupiah(detailBook.package_price_snapshot)} />
                )}
                {detailBook.checkin_at && (
                  <InfoRow icon={<MapPin size={13}/>} label="Checkin" value={new Date(detailBook.checkin_at).toLocaleString("id-ID")} />
                )}
                {detailBook.receipt_uploaded_at && (
                  <InfoRow icon={<Upload size={13}/>} label="Transaksi disubmit" value={new Date(detailBook.receipt_uploaded_at).toLocaleString("id-ID")} />
                )}
              </div>

              {/* Bukti kunjungan — served dari URL API */}
              {detailBook.receipt_url && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3">
                  <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1"><Upload size={12}/> Bukti Kunjungan dari Guide</p>
                  <img
                    src={resolveReceiptUrl(detailBook.receipt_url)}
                    alt="Bukti kunjungan"
                    className="rounded-md max-h-52 w-full object-contain bg-black/10"
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      el.style.display = 'none'
                      el.nextElementSibling?.removeAttribute('hidden')
                    }}
                  />
                  <p hidden className="text-xs text-muted-foreground mt-1">
                    File tidak dapat ditampilkan — mungkin berupa PDF.
                    <a href={resolveReceiptUrl(detailBook.receipt_url)} target="_blank" rel="noopener noreferrer"
                      className="ml-1 text-amber-400 hover:underline">Buka file ↗</a>
                  </p>
                </div>
              )}

              {/* Panel crosscheck transaksi */}
              {(isNeedTxReview || detailBook.status === "completed") && (
                txLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">Memuat data transaksi...</div>
                ) : detailTx ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Receipt size={15} className="text-emerald-400" />
                      <span className="text-sm font-semibold">Detail Transaksi #{detailTx.transaction_code}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {detailTx.status === "pending_vendor_approval" ? "Menunggu Approval" :
                         detailTx.status === "settled" ? "Settled" :
                         detailTx.status === "payment_pending" ? "Menunggu Bayar" :
                         detailTx.status === "rejected" ? "Ditolak" : detailTx.status}
                      </Badge>
                    </div>

                    {/* Breakdown split */}
                    <div className="rounded-lg border bg-muted/20 divide-y text-sm">
                      <div className="px-3 py-2 flex justify-between">
                        <span className="text-muted-foreground">Gross Total</span>
                        <span className="font-bold">{formatRupiah(detailTx.gross_amount)}</span>
                      </div>
                      {detailTx.extra_amount && Number(detailTx.extra_amount) > 0 && (
                        <div className="px-3 py-2 flex justify-between">
                          <span className="text-muted-foreground">↳ Extra ({detailTx.extra_notes || "tambahan"})</span>
                          <span>{formatRupiah(detailTx.extra_amount)}</span>
                        </div>
                      )}
                      <div className="px-3 py-2 flex justify-between">
                        <span className="text-muted-foreground">Bagian Vendor ({detailTx.vendor_percent_snapshot}%)</span>
                        <span className="text-blue-400 font-medium">{formatRupiah(detailTx.vendor_amount)}</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between">
                        <span className="text-muted-foreground">Komisi Guide ({detailTx.guide_percent_snapshot}%)</span>
                        <span>{formatRupiah(detailTx.guide_commission)}</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between">
                        <span className="text-muted-foreground">Fee Platform ({detailTx.platform_percent_snapshot}%)</span>
                        <span>{formatRupiah(detailTx.platform_fee)}</span>
                      </div>
                    </div>

                    {/* Tagihan ke vendor */}
                    <div className="rounded-lg border border-orange-500/40 bg-orange-500/5 px-4 py-3">
                      <p className="text-xs text-muted-foreground mb-1">Tagihan yang Harus Dibayar Vendor ke Custherds</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Komisi Guide + Fee Platform</span>
                        <span className="text-lg font-bold text-orange-400">
                          {formatRupiah(Number(detailTx.guide_commission) + Number(detailTx.platform_fee))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        = {formatRupiah(detailTx.guide_commission)} + {formatRupiah(detailTx.platform_fee)}
                      </p>
                    </div>

                    {/* Invoice URL jika pay_as_you_go */}
                    {invoiceUrl && (
                      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-2">Link Pembayaran</p>
                        <a href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline break-all">{invoiceUrl}</a>
                      </div>
                    )}

                    {detailTx.vendor_rejection_reason && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Alasan Ditolak</p>
                        <p className="text-red-400">{detailTx.vendor_rejection_reason}</p>
                      </div>
                    )}

                    {/* Form pilih metode bayar */}
                    {txPendingApproval && showPayMethod && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 space-y-3">
                        <p className="text-sm font-medium">Pilih Metode Pembayaran</p>
                        <div className="flex gap-3 flex-wrap">
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleTxApprove('deposit')}
                            disabled={submitting}
                          >
                            <Banknote size={14} className="mr-1" /> Potong Deposit
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleTxApprove('pay_as_you_go')}
                            disabled={submitting}
                          >
                            <CreditCard size={14} className="mr-1" /> Pay As You Go
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowPayMethod(false)} disabled={submitting}>Batal</Button>
                      </div>
                    )}

                    {/* Form reject transaksi */}
                    {txPendingApproval && showTxReject && (
                      <div className="space-y-2">
                        <Label className="text-sm">Alasan Penolakan Transaksi <span className="text-red-500">*</span></Label>
                        <Textarea placeholder="Tuliskan alasan..." value={txRejectReason}
                          onChange={e => { setTxRejectReason(e.target.value); setActionError("") }} rows={3} />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowTxReject(false)}>Batal</Button>
                          <Button variant="destructive" size="sm" onClick={handleTxReject} disabled={submitting}>
                            {submitting ? "Menolak..." : "Konfirmasi Tolak"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <AlertCircle size={14} /> Data transaksi belum tersedia.
                  </div>
                )
              )}

              {detailBook.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Catatan dari Guide</p>
                  <p className="bg-muted/30 rounded-lg px-3 py-2">{detailBook.notes}</p>
                </div>
              )}
              {detailBook.status === "rejected" && detailBook.vendor_rejection_reason && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Alasan Penolakan Booking</p>
                  <p className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400">{detailBook.vendor_rejection_reason}</p>
                </div>
              )}
              {detailBook.status === "cancelled" && detailBook.cancelled_reason && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Alasan Pembatalan</p>
                  <p className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 text-orange-400">{detailBook.cancelled_reason}</p>
                </div>
              )}
              {actionError && <p className="text-xs text-red-500">{actionError}</p>}
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={closeDetail} disabled={submitting}>Tutup</Button>
            {isPending && !showReject && (
              <>
                <Button variant="destructive" onClick={() => setShowReject(true)}>
                  <XCircle size={14} className="mr-1" /> Tolak
                </Button>
                <Button onClick={handleApprove} disabled={submitting}>
                  <CheckCircle size={14} className="mr-1" />{submitting ? "Menyetujui..." : "Setujui"}
                </Button>
              </>
            )}
            {isPending && showReject && (
              <div className="w-full space-y-2">
                <Label className="text-sm">Alasan Penolakan <span className="text-red-500">*</span></Label>
                <Textarea placeholder="Tuliskan alasan..." value={rejectReason}
                  onChange={e => { setRejectReason(e.target.value); setActionError("") }} rows={3} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowReject(false)} disabled={submitting}>Kembali</Button>
                  <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                    {submitting ? "Menolak..." : "Konfirmasi Tolak"}
                  </Button>
                </div>
              </div>
            )}
            {isConfirmed && (
              <Button onClick={handleCheckin} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MapPin size={14} className="mr-1" />{submitting ? "Memproses..." : "Checkin Guide"}
              </Button>
            )}
            {isNeedTxReview && txPendingApproval && !showPayMethod && !showTxReject && (
              <>
                <Button variant="destructive" onClick={() => setShowTxReject(true)} disabled={submitting}>
                  <XCircle size={14} className="mr-1" /> Tolak Transaksi
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowPayMethod(true)} disabled={submitting}>
                  <CheckCircle2 size={14} className="mr-1" /> Approve Transaksi
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center px-3 py-2 gap-4">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">{icon}{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  )
}
