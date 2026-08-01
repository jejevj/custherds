"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import {
  bookingReportsService,
  BookingReport,
  BookingReportCreate,
  REPORT_TYPE_LABEL,
} from "@/services/booking-reports.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Receipt, Flag, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  pending_receipt:    "Submit Transaksi",
  pending_completion: "Menunggu Konfirmasi Vendor",
  completed:          "Selesai",
  rejected:           "Ditolak",
  cancelled:          "Dibatalkan",
}

function canCancel(b: Booking): boolean {
  return ["pending_vendor", "confirmed", "pending_receipt"].includes(b.status) && !b.checkin_at
}

/**
 * Tombol "Laporkan" muncul jika:
 * - "completed"  → selalu bisa (dispute transaksi)
 * - "rejected"   → hanya jika tx_attempt sudah habis (>= tx_attempt_max)
 * DAN booking belum pernah dilaporkan (tidak ada di reportedIds)
 */
function canReport(b: Booking, reportedIds: Set<string>): boolean {
  if (reportedIds.has(b.id)) return false
  if (b.status === "completed") return true
  if (b.status === "rejected") return b.tx_attempt >= b.tx_attempt_max
  return false
}

// ─── Modal Laporan ────────────────────────────────────────────────────────────
interface ReportModalProps {
  booking: Booking
  onClose: () => void
  onSuccess: (bookingId: string) => void
}

function ReportModal({ booking, onClose, onSuccess }: ReportModalProps) {
  const [description, setDescription] = useState("")
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError("Deskripsi laporan wajib diisi."); return }
    setSubmitting(true)
    setError("")
    try {
      const payload: BookingReportCreate = {
        booking_id:  booking.id,
        description: description.trim(),
      }
      await bookingReportsService.create(payload)
      onSuccess(booking.id)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            "Gagal mengirim laporan. Coba lagi."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h2 className="text-base font-semibold">Laporkan Booking</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{booking.booking_code}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Deskripsi <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Jelaskan masalah yang terjadi secara detail..."
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground text-right">{description.length} karakter</p>
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={submitting || !description.trim()}
            >
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Flag size={14} className="mr-1" />}
              {submitting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Toast sukses sederhana ───────────────────────────────────────────────────
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GuideBookingsPage() {
  const router  = useRouter()
  const [bookings,       setBookings]       = useState<Booking[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState("")
  const [reportTarget,   setReportTarget]   = useState<Booking | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  // Set berisi booking_id yang sudah pernah dilaporkan
  const [reportedIds,    setReportedIds]    = useState<Set<string>>(new Set())

  const { query, setQuery, filtered } = useTableSearch(bookings)

  useEffect(() => {
    Promise.all([
      bookingsService.list(),
      bookingReportsService.list(),
    ])
      .then(([bks, reports]) => {
        setBookings(bks)
        // Kumpulkan booking_id yang sudah pernah dilaporkan
        setReportedIds(new Set((reports as BookingReport[]).map(r => r.booking_id)))
      })
      .catch(() => setError("Gagal memuat data."))
      .finally(() => setLoading(false))
  }, [])

  function handleReportSuccess(bookingId: string) {
    setReportTarget(null)
    setReportedIds(prev => new Set([...prev, bookingId]))
    setSuccessMessage("Laporan berhasil dikirim! Tim kami akan segera meninjau laporan Anda.")
  }

  return (
    <>
      {reportTarget && (
        <ReportModal
          booking={reportTarget}
          onClose={() => setReportTarget(null)}
          onSuccess={handleReportSuccess}
        />
      )}
      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">Semua booking yang kamu buat.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TableSearchInput value={query} onChange={setQuery} placeholder="Cari kode, tanggal, status..." />
          {query && <p className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} dari {bookings.length} hasil</p>}
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
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">
                  {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada booking."}
                </td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3">{b.pax_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{STATUS_LABEL[b.status] ?? b.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {/* Detail — selalu ada */}
                      <Button size="sm" variant="outline" onClick={() => router.push(`/guide/bookings/${b.id}`)}>
                        <Eye size={13} className="mr-1" /> Detail
                      </Button>

                      {/* Submit Transaksi */}
                      {b.status === "pending_receipt" && (
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => router.push(`/guide/bookings/${b.id}`)}>
                          <Receipt size={13} className="mr-1" /> Submit Transaksi
                        </Button>
                      )}

                      {/* Batalkan */}
                      {canCancel(b) && (
                        <Button size="sm" variant="outline" className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => router.push(`/guide/bookings/${b.id}`)}>
                          Batalkan
                        </Button>
                      )}

                      {/* Laporkan — hanya jika belum pernah dilaporkan & kondisi terpenuhi */}
                      {canReport(b, reportedIds) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                          onClick={() => setReportTarget(b)}
                        >
                          <Flag size={13} className="mr-1" /> Laporkan
                        </Button>
                      )}

                      {/* Sudah dilaporkan */}
                      {reportedIds.has(b.id) && (b.status === "completed" || (b.status === "rejected" && b.tx_attempt >= b.tx_attempt_max)) && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded-md px-2 py-1">
                          <Flag size={11} /> Sudah Dilaporkan
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
