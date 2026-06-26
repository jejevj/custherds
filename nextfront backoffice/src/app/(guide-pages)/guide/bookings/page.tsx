"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed:      "default",
  pending_vendor: "secondary",
  rejected:       "destructive",
  cancelled:      "destructive",
}

export default function GuideBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  // cancel dialog state
  const [cancelTarget,  setCancelTarget]  = useState<string | null>(null)
  const [cancelReason,  setCancelReason]  = useState("")
  const [cancelError,   setCancelError]   = useState("")
  const [submitting,    setSubmitting]    = useState(false)

  // rejection reason detail dialog
  const [viewReason,    setViewReason]    = useState<string | null>(null)

  useEffect(() => {
    bookingsService.list()
      .then(setBookings)
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [])

  const openCancelDialog = (id: string) => {
    setCancelTarget(id)
    setCancelReason("")
    setCancelError("")
  }

  const submitCancel = async () => {
    if (!cancelTarget) return
    if (!cancelReason.trim()) {
      setCancelError("Alasan pembatalan wajib diisi.")
      return
    }
    setSubmitting(true)
    try {
      await bookingsService.cancel(cancelTarget, cancelReason.trim())
      setBookings(prev =>
        prev.map(b => b.id === cancelTarget
          ? { ...b, status: "cancelled", cancelled_reason: cancelReason.trim(), cancelled_by: "guide" }
          : b
        )
      )
      setCancelTarget(null)
    } catch {
      setCancelError("Gagal membatalkan booking. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
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
              <th className="px-4 py-3 font-medium">Keterangan</th>
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
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {b.status === "rejected" && b.vendor_rejection_reason && (
                    <button
                      onClick={() => setViewReason(b.vendor_rejection_reason!)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Lihat alasan
                    </button>
                  )}
                  {b.status === "cancelled" && b.cancelled_reason && (
                    <span className="text-xs text-muted-foreground">{b.cancelled_reason}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {(b.status === "pending_vendor" || b.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-300 hover:bg-red-50"
                      onClick={() => openCancelDialog(b.id)}
                    >
                      Batalkan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Booking</DialogTitle>
          </DialogHeader>
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
              <AlertTriangle className="w-5 h-5" />
              Alasan Penolakan
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
