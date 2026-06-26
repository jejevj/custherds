"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Upload } from "lucide-react"

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
  pending_vendor:     "Menunggu Approval Vendor",
  confirmed:          "Dikonfirmasi — Tunjukkan ke Vendor",
  pending_receipt:    "Sudah Checkin — Upload Receipt",
  pending_completion: "Menunggu Konfirmasi Vendor",
  completed:          "Selesai ✓",
  rejected:           "Ditolak",
  cancelled:          "Dibatalkan",
}

export default function GuideBookingsPage() {
  const [bookings,   setBookings]   = useState<Booking[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [submitting, setSubmitting] = useState(false)

  // cancel dialog
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError,  setCancelError]  = useState("")

  // upload receipt dialog
  const [receiptTarget, setReceiptTarget] = useState<string | null>(null)
  const [receiptUrl,    setReceiptUrl]    = useState("")
  const [receiptError,  setReceiptError]  = useState("")

  // view rejection reason
  const [viewReason, setViewReason] = useState<string | null>(null)

  useEffect(() => {
    bookingsService.list()
      .then(setBookings)
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [])

  const submitCancel = async () => {
    if (!cancelTarget) return
    if (!cancelReason.trim()) { setCancelError("Alasan pembatalan wajib diisi."); return }
    setSubmitting(true)
    try {
      await bookingsService.cancel(cancelTarget, cancelReason.trim())
      setBookings(prev => prev.map(b =>
        b.id === cancelTarget ? { ...b, status: "cancelled", cancelled_reason: cancelReason.trim(), cancelled_by: "guide" } : b
      ))
      setCancelTarget(null)
    } catch { setCancelError("Gagal membatalkan booking. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  const submitReceipt = async () => {
    if (!receiptTarget) return
    if (!receiptUrl.trim()) { setReceiptError("URL receipt wajib diisi."); return }
    setSubmitting(true)
    try {
      const updated = await bookingsService.uploadReceipt(receiptTarget, receiptUrl.trim())
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setReceiptTarget(null)
      setReceiptUrl("")
    } catch { setReceiptError("Gagal upload receipt. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Semua booking yang kamu buat.</p>
        </div>
        <Button asChild><Link href="/guide/bookings/create">+ Buat Booking</Link></Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Info</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Belum ada booking.</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                  {b.status === "confirmed" && (
                    <span className="text-blue-400">Tunjukkan kode booking ini ke petugas vendor saat tiba</span>
                  )}
                  {b.status === "rejected" && b.vendor_rejection_reason && (
                    <button onClick={() => setViewReason(b.vendor_rejection_reason!)} className="flex items-center gap-1 text-red-500 hover:underline">
                      <AlertTriangle className="w-3 h-3" /> Lihat alasan
                    </button>
                  )}
                  {b.status === "cancelled" && b.cancelled_reason && (
                    <span>{b.cancelled_reason}</span>
                  )}
                  {b.status === "pending_completion" && (
                    <span className="text-blue-400">Menunggu vendor konfirmasi selesai</span>
                  )}
                  {b.status === "completed" && (
                    <span className="text-emerald-500">Kunjungan selesai ✓</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {/* Upload Receipt: hanya guide, hanya saat pending_receipt (setelah vendor checkin) */}
                    {b.status === "pending_receipt" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => { setReceiptTarget(b.id); setReceiptUrl(""); setReceiptError("") }}
                      >
                        <Upload size={13} className="mr-1" /> Upload Receipt
                      </Button>
                    )}
                    {/* Cancel */}
                    {["pending_vendor", "confirmed", "pending_receipt", "pending_completion"].includes(b.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-300 hover:bg-red-50"
                        onClick={() => { setCancelTarget(b.id); setCancelReason(""); setCancelError("") }}
                      >
                        Batalkan
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Receipt Dialog */}
      <Dialog open={!!receiptTarget} onOpenChange={open => { if (!open) setReceiptTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" /> Upload Bukti Kunjungan
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload URL file bukti kunjungan (foto, invoice, atau dokumen lainnya).
              Vendor sudah melakukan checkin, sekarang kamu perlu submit receipt.
            </p>
            <div className="space-y-1">
              <Label htmlFor="receipt-url">URL Receipt <span className="text-red-500">*</span></Label>
              <Input
                id="receipt-url"
                placeholder="https://..."
                value={receiptUrl}
                onChange={e => { setReceiptUrl(e.target.value); setReceiptError("") }}
              />
            </div>
            {receiptError && <p className="text-sm text-red-500">{receiptError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptTarget(null)} disabled={submitting}>Batal</Button>
            <Button onClick={submitReceipt} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Upload size={14} className="mr-1" />
              {submitting ? "Mengupload..." : "Submit Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Batalkan Booking</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason">Alasan Pembatalan <span className="text-red-500">*</span></Label>
            <Textarea
              id="cancel-reason"
              placeholder="Tuliskan alasan pembatalan booking ini..."
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError("") }}
              rows={4}
            />
            {cancelError && <p className="text-sm text-red-500">{cancelError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={submitting}>Kembali</Button>
            <Button variant="destructive" onClick={submitCancel} disabled={submitting}>
              {submitting ? "Membatalkan..." : "Ya, Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Rejection Reason Dialog */}
      <Dialog open={!!viewReason} onOpenChange={open => { if (!open) setViewReason(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Alasan Penolakan
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewReason}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReason(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
