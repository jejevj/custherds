"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, CheckCircle, XCircle, CalendarDays, Users, FileText, Package, MapPin, Upload, CheckCircle2 } from "lucide-react"
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
  pending_receipt:    "Checkin ✓ — Menunggu Receipt Guide",
  pending_completion: "Perlu Konfirmasi Selesai",
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

  const [detailBook,   setDetailBook]   = useState<Booking | null>(null)
  const [showReject,   setShowReject]   = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionError,  setActionError]  = useState("")
  const [submitting,   setSubmitting]   = useState(false)

  useEffect(() => {
    bookingsService.list()
      .then(d => setBookings(status ? d.filter(b => b.status === status) : d))
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [status])

  const openDetail = (b: Booking) => {
    setDetailBook(b); setShowReject(false); setRejectReason(""); setActionError("")
  }
  const closeDetail = () => { setDetailBook(null); setShowReject(false) }

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

  const handleComplete = async () => {
    if (!detailBook) return
    setSubmitting(true)
    try {
      const updated = await bookingsService.complete(detailBook.id)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setDetailBook(updated)
    } catch { setActionError("Gagal menyelesaikan booking. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  const isPending      = detailBook?.status === "pending_vendor"
  const isConfirmed    = detailBook?.status === "confirmed"
  const isNeedComplete = detailBook?.status === "pending_completion"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "pending_vendor"     ? "Bookings — Pending Approval"
          : status === "pending_completion" ? "Bookings — Perlu Konfirmasi Selesai"
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
        <DialogContent className="max-w-lg">
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
                  <InfoRow icon={<MapPin size={13}/>} label="Checkin oleh Vendor" value={new Date(detailBook.checkin_at).toLocaleString("id-ID")} />
                )}
                {detailBook.receipt_uploaded_at && (
                  <InfoRow icon={<Upload size={13}/>} label="Receipt diupload Guide" value={new Date(detailBook.receipt_uploaded_at).toLocaleString("id-ID")} />
                )}
                {detailBook.completed_at && (
                  <InfoRow icon={<CheckCircle2 size={13}/>} label="Selesai pada" value={new Date(detailBook.completed_at).toLocaleString("id-ID")} />
                )}
              </div>
              {detailBook.receipt_url && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Bukti Kunjungan (Receipt dari Guide)</p>
                  <a href={detailBook.receipt_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-amber-400 hover:underline break-all">
                    {detailBook.receipt_url}
                  </a>
                </div>
              )}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Total Pembayaran</span>
                <span className="text-lg font-bold text-emerald-400">{formatRupiah(detailBook.total_price)}</span>
              </div>
              {detailBook.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Catatan dari Guide</p>
                  <p className="bg-muted/30 rounded-lg px-3 py-2">{detailBook.notes}</p>
                </div>
              )}
              {detailBook.status === "rejected" && detailBook.vendor_rejection_reason && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Alasan Penolakan</p>
                  <p className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400">{detailBook.vendor_rejection_reason}</p>
                </div>
              )}
              {detailBook.status === "cancelled" && detailBook.cancelled_reason && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Alasan Pembatalan</p>
                  <p className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 text-orange-400">{detailBook.cancelled_reason}</p>
                </div>
              )}
              {isPending && showReject && (
                <div className="space-y-2">
                  <Label htmlFor="reject-reason" className="text-sm">Alasan Penolakan <span className="text-red-500">*</span></Label>
                  <Textarea id="reject-reason" placeholder="Tuliskan alasan..." value={rejectReason}
                    onChange={e => { setRejectReason(e.target.value); setActionError("") }} rows={3} />
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
              <>
                <Button variant="outline" onClick={() => setShowReject(false)} disabled={submitting}>Kembali</Button>
                <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                  {submitting ? "Menolak..." : "Konfirmasi Tolak"}
                </Button>
              </>
            )}
            {isConfirmed && (
              <Button onClick={handleCheckin} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MapPin size={14} className="mr-1" />{submitting ? "Memproses..." : "Checkin Guide"}
              </Button>
            )}
            {isNeedComplete && (
              <Button onClick={handleComplete} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 size={14} className="mr-1" />{submitting ? "Memproses..." : "Konfirmasi Selesai"}
              </Button>
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
