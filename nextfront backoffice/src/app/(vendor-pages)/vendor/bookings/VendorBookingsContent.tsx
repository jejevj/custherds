"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
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

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed:      "default",
  pending_vendor: "secondary",
  rejected:       "destructive",
}

export default function VendorBookingsContent() {
  const params = useSearchParams()
  const status = params.get("status") ?? undefined

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  // reject dialog state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError,  setRejectError]  = useState("")
  const [submitting,   setSubmitting]   = useState(false)

  useEffect(() => {
    bookingsService.list()
      .then(d => setBookings(status ? d.filter(b => b.status === status) : d))
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [status])

  const approve = async (id: string) => {
    await bookingsService.approve(id, "approve")
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b))
  }

  const openRejectDialog = (id: string) => {
    setRejectTarget(id)
    setRejectReason("")
    setRejectError("")
  }

  const submitReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setRejectError("Alasan penolakan wajib diisi.")
      return
    }
    setSubmitting(true)
    try {
      await bookingsService.approve(rejectTarget, "reject", rejectReason.trim())
      setBookings(prev =>
        prev.map(b => b.id === rejectTarget
          ? { ...b, status: "rejected", vendor_rejection_reason: rejectReason.trim() }
          : b
        )
      )
      setRejectTarget(null)
    } catch {
      setRejectError("Gagal menolak booking. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "pending_vendor" ? "Bookings — Pending Approval" : "All Bookings"}
        </h1>
        <p className="text-muted-foreground">Booking dari guide untuk produk kamu.</p>
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
              {status === "pending_vendor" && <th className="px-4 py-3 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Tidak ada data.</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                </td>
                {status === "pending_vendor" && (
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" onClick={() => approve(b.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => openRejectDialog(b.id)}>Reject</Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) setRejectTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="reject-reason">Alasan Penolakan <span className="text-red-500">*</span></Label>
            <Textarea
              id="reject-reason"
              placeholder="Tuliskan alasan kenapa booking ini ditolak..."
              value={rejectReason}
              onChange={e => { setRejectReason(e.target.value); setRejectError("") }}
              rows={4}
            />
            {rejectError && <p className="text-sm text-red-500">{rejectError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={submitting}>Batal</Button>
            <Button variant="destructive" onClick={submitReject} disabled={submitting}>
              {submitting ? "Menolak..." : "Tolak Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
