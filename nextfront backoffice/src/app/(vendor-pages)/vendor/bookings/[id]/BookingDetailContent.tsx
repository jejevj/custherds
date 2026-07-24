"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { bookingsService, Booking } from "@/services/bookings.service"
import { transactionsService, Transaction, resolveReceiptUrl } from "@/services/transactions.service"
import { guidesService } from "@/services/guides.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import QRCode from "qrcode.react"
import {
  ArrowLeft, FileText, CalendarDays, Users, Package, MapPin,
  Upload, CheckCircle, XCircle, CheckCircle2, Receipt, AlertCircle,
  ZoomIn, ChevronLeft, ChevronRight, X, Loader2,
  QrCode, RefreshCw,
} from "lucide-react"
import { api } from "@/services/api"

const POLL_INTERVAL_MS  = 5000
const POLL_MAX_ATTEMPTS = 60

interface PaymentStatusResponse {
  tx_id: string
  status: string
  paid_at: string | null
  settled_at: string | null
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  pending_vendor: "secondary",
  pending_receipt: "secondary",
  pending_completion: "secondary",
  completed: "default",
  rejected: "destructive",
  cancelled: "destructive",
}

const STATUS_LABEL: Record<string, string> = {
  pending_vendor: "Menunggu Approval",
  confirmed: "Dikonfirmasi",
  pending_receipt: "Checkin ✓ — Menunggu Transaksi Guide",
  pending_completion: "Perlu Review Transaksi",
  completed: "Selesai",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
}

function formatRupiah(n?: number | string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

function parseExtraPhotos(notes: string | null | undefined): string[] {
  if (!notes) return []
  const tag = "[extra_photos:"
  const start = notes.indexOf(tag)
  if (start === -1) return []
  const sub = notes.slice(start + tag.length)
  const end = sub.indexOf("]")
  if (end === -1) return []
  try { return JSON.parse(sub.slice(0, end + 1)) as string[] }
  catch { return [] }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────────────
function Lightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex)
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape")     { e.stopPropagation(); e.preventDefault(); onClose() }
      if (e.key === "ArrowLeft")  { e.stopPropagation(); prev() }
      if (e.key === "ArrowRight") { e.stopPropagation(); next() }
    }
    window.addEventListener("keydown", h, true)
    return () => window.removeEventListener("keydown", h, true)
  }, [onClose]) // eslint-disable-line
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {images.length}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><X size={20} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button onClick={prev} className="absolute left-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"><ChevronLeft size={22} /></button>
        )}
        <img key={images[idx]} src={images[idx]} alt={`Foto ${idx + 1}`} className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-2xl" />
        {images.length > 1 && (
          <button onClick={next} className="absolute right-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"><ChevronRight size={22} /></button>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 justify-center px-4 py-3 shrink-0 overflow-x-auto" onClick={e => e.stopPropagation()}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                i === idx ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-80"
              }`}>
              <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── QR Modal ──────────────────────────────────────────────────────────────────────────
function QrisModal({ qrisString, referenceNo, onClose }: { qrisString: string; referenceNo?: string | null; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-emerald-600" />
            <span className="font-semibold text-gray-800 text-sm">Scan QRIS untuk Bayar</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="border-4 border-emerald-500 rounded-xl p-2 bg-white">
          <QRCode value={qrisString} size={220} level="M" includeMargin={false} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500">Gunakan aplikasi bank / e-wallet apapun</p>
          {referenceNo && (
            <p className="text-[10px] text-gray-400 font-mono">Ref: {referenceNo}</p>
          )}
        </div>
        <div className="w-full rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[11px] text-amber-700 text-center">
            QR berlaku <strong>30 menit</strong>. Halaman otomatis update setelah pembayaran.
          </p>
        </div>
        <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
          Tutup
        </button>
      </div>
    </div>
  )
}

// ── Photo Grid ───────────────────────────────────────────────────────────────────────
function PhotoGrid({ urls, label }: { urls: string[]; label: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  if (!urls.length) return null
  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox images={urls} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3">
        <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
          <Upload size={12} /> {label}
          <span className="ml-1 text-white/40 font-normal">({urls.length} foto — klik untuk lihat)</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, i) => (
            <button key={i} className="relative group rounded-md overflow-hidden bg-black/10 aspect-square" onClick={() => setLightboxIdx(i)}>
              <img src={url} alt={`foto-${i + 1}`} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ZoomIn size={20} className="text-white" />
              </div>
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{i + 1}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Settlement Warning Banner ─────────────────────────────────────────────────────────
function SettlementWarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
      <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-amber-300">
          Rekening settlement guide belum terdaftar
        </p>
        <p className="text-xs text-amber-400/80 leading-relaxed">
          Transaksi QRIS tidak dapat diproses karena guide ini belum memiliki
          Bank Settlement ID. Silakan hubungi Admin untuk mendaftarkan rekening
          distribusi guide terlebih dahulu.
        </p>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────────────
export default function BookingDetailContent() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [booking, setBooking]         = useState<Booking | null>(null)
  const [tx, setTx]                   = useState<Transaction | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [submitting, setSubmitting]   = useState(false)
  const [retrying, setRetrying]       = useState(false)
  const [actionError, setActionError] = useState("")
  const [polling, setPolling]         = useState(false)

  const [showReject, setShowReject]         = useState(false)
  const [rejectReason, setRejectReason]     = useState("")
  const [showTxReject, setShowTxReject]     = useState(false)
  const [txRejectReason, setTxRejectReason] = useState("")
  const [showPayConfirm, setShowPayConfirm] = useState(false)

  const [qrisString, setQrisString]       = useState<string | null>(null)
  const [dokuRefNo, setDokuRefNo]         = useState<string | null>(null)
  const [showQrisModal, setShowQrisModal] = useState(false)

  // ── Settlement status guide ──────────────────────────────────────────────
  // null  = belum di-fetch / tidak diketahui
  // true  = siap (bank_settlement_id sudah ada)
  // false = belum siap
  const [guideSettlementReady, setGuideSettlementReady]     = useState<boolean | null>(null)
  const [guideSettlementChecking, setGuideSettlementChecking] = useState(false)

  const pollTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollAttemptsRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    pollTimerRef.current = null
    setPolling(false)
    pollAttemptsRef.current = 0
  }, [])

  const fetchData = useCallback(async (silent = false) => {
    try {
      const b = await bookingsService.get(id)
      setBooking(b)
      if (["pending_completion", "completed"].includes(b.status)) {
        try {
          const t = await transactionsService.getByBookingId(b.id)
          setTx(t)
          if (t?.status === "payment_pending" && t?.xendit_invoice_url) {
            setQrisString(t.xendit_invoice_url)
            setDokuRefNo(t.xendit_invoice_id ?? null)
          }
        } catch { /* tx belum ada */ }
      }
    } catch {
      if (!silent) setError("Gagal memuat detail booking.")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [id])

  // ── Fetch settlement status guide saat booking tersedia ─────────────────
  const checkGuideSettlement = useCallback(async (guideId: string) => {
    setGuideSettlementChecking(true)
    try {
      const result = await guidesService.getSettlementStatus(guideId)
      setGuideSettlementReady(result.has_bank_settlement_id)
    } catch {
      // Jika gagal fetch, biarkan null — tombol tidak akan di-disable permanen
      setGuideSettlementReady(null)
    } finally {
      setGuideSettlementChecking(false)
    }
  }, [])

  // ── Polling: hit /payment-status agar backend query DOKU ─────────────────────────
  const startPolling = useCallback((txId: string) => {
    if (pollTimerRef.current) return
    setPolling(true)
    pollAttemptsRef.current = 0

    const tick = async () => {
      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling()
        return
      }
      pollAttemptsRef.current++

      try {
        const result = await api.get<PaymentStatusResponse>(`/transactions/${txId}/payment-status`)

        if (result.status === "settled") {
          stopPolling()
          setShowQrisModal(false)
          const [latestBooking, latestTx] = await Promise.all([
            bookingsService.get(id),
            transactionsService.getByBookingId(id),
          ])
          setBooking(latestBooking)
          setTx(latestTx)
          toast.success("Pembayaran QRIS berhasil!", {
            description: "Transaksi telah settled dan booking selesai.",
            duration: 6000,
          })
          return
        }

        if (result.status === "payment_failed") {
          stopPolling()
          setShowQrisModal(false)
          setTx(prev => prev ? { ...prev, status: "payment_failed" } : prev)
          toast.error("QRIS expired atau pembayaran gagal.", {
            description: "Klik \"Bayar Ulang\" untuk generate QRIS baru.",
            duration: 8000,
          })
          return
        }
      } catch (e) {
        console.error("[polling:payment-status]", e)
      }

      pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
    }

    pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
  }, [id, stopPolling]) // eslint-disable-line

  useEffect(() => { fetchData() }, [fetchData])

  // Jalankan pengecekan settlement saat booking sudah loaded & status pending_completion
  useEffect(() => {
    if (booking?.guide_id && booking.status === "pending_completion") {
      checkGuideSettlement(booking.guide_id)
    }
  }, [booking?.guide_id, booking?.status, checkGuideSettlement])

  useEffect(() => {
    if (tx?.status === "payment_pending" && tx?.id) {
      startPolling(tx.id)
    } else {
      stopPolling()
    }
    return () => { stopPolling() }
  }, [tx?.status, tx?.id]) // eslint-disable-line

  // ── Retry QRIS ──────────────────────────────────────────────────────────────────
  const handleRetryPayment = async () => {
    if (!tx) return
    setRetrying(true)
    try {
      const result = await transactionsService.retryPayment(tx.id)
      setTx(result.transaction)
      if (result.qris_string) {
        setQrisString(result.qris_string)
        setDokuRefNo(result.doku_reference_no ?? null)
        setShowQrisModal(true)
      }
      toast.success("QRIS baru berhasil dibuat!", { description: "Silakan scan QR untuk menyelesaikan pembayaran.", duration: 5000 })
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Gagal membuat QRIS baru."
      toast.error("Gagal retry pembayaran", { description: detail, duration: 6000 })
    } finally {
      setRetrying(false)
    }
  }

  const handleApprove = async () => {
    if (!booking) return
    setSubmitting(true)
    try {
      const updated = await bookingsService.approve(booking.id, "approve")
      setBooking(updated)
    } catch { setActionError("Gagal approve booking.") }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!booking || !rejectReason.trim()) { setActionError("Alasan wajib diisi."); return }
    setSubmitting(true)
    try {
      await bookingsService.approve(booking.id, "reject", rejectReason.trim())
      router.push("/vendor/bookings")
    } catch { setActionError("Gagal menolak booking.") }
    finally { setSubmitting(false) }
  }

  const handleCheckin = async () => {
    if (!booking) return
    setSubmitting(true)
    try {
      const updated = await bookingsService.checkin(booking.id)
      setBooking(updated)
    } catch { setActionError("Gagal checkin.") }
    finally { setSubmitting(false) }
  }

  // ── Approve transaksi — QRIS only ────────────────────────────────────────────
  const handleTxApproveQris = async () => {
    if (!tx) return
    setSubmitting(true)
    try {
      const result = await transactionsService.approve(tx.id, "pay_as_you_go")
      setTx(result.transaction)
      if (result.qris_string) {
        setQrisString(result.qris_string)
        setDokuRefNo(result.doku_reference_no ?? null)
        setShowQrisModal(true)
      }
      const updated = await bookingsService.get(booking!.id)
      setBooking(updated)
      setShowPayConfirm(false)
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail ?? "Gagal approve transaksi."
      setActionError(detail)
    } finally { setSubmitting(false) }
  }

  const handleTxReject = async () => {
    if (!tx || !txRejectReason.trim()) { setActionError("Alasan wajib diisi."); return }
    setSubmitting(true)
    try {
      await transactionsService.reject(tx.id, txRejectReason.trim())
      const updated = await bookingsService.get(booking!.id)
      setBooking(updated)
      setTx(null)
      setShowTxReject(false)
    } catch (err: unknown) {
      setActionError((err as { detail?: string })?.detail ?? "Gagal reject transaksi.")
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Memuat...</div>
  if (error || !booking) return <div className="p-8 text-red-400">{error || "Booking tidak ditemukan."}</div>

  const isPending         = booking.status === "pending_vendor"
  const isConfirmed       = booking.status === "confirmed"
  const isNeedTxReview    = booking.status === "pending_completion"
  const txPendingApproval = tx?.status === "pending_vendor_approval"
  const txPaymentPending  = tx?.status === "payment_pending"
  const txPaymentFailed   = tx?.status === "payment_failed"

  // Tombol QRIS di-disable jika: settlement belum ready (false) atau sedang dicek
  const qrisBlocked = guideSettlementReady === false
  const qrisLoading = guideSettlementChecking

  const txPhotos: string[] = tx
    ? [
        ...(tx.receipt_image ? [resolveReceiptUrl(tx.receipt_image)] : []),
        ...parseExtraPhotos(tx.receipt_notes).map(resolveReceiptUrl),
      ]
    : []

  const hasTxPanel = (isNeedTxReview || booking.status === "completed") && !!tx
  const activeQris = txPaymentPending ? (qrisString ?? tx?.xendit_invoice_url) : null

  return (
    <div className="w-full space-y-5 py-6 px-4">

      {showQrisModal && activeQris && (
        <QrisModal
          qrisString={activeQris}
          referenceNo={dokuRefNo ?? tx?.xendit_invoice_id}
          onClose={() => setShowQrisModal(false)}
        />
      )}

      <button onClick={() => router.push("/vendor/bookings")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={16} /> Kembali ke Daftar Booking
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText size={18} /> Detail Booking
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{booking.booking_code}</p>
        </div>
        <Badge variant={STATUS_VARIANT[booking.status] ?? "secondary"}>
          {STATUS_LABEL[booking.status] ?? booking.status}
        </Badge>
      </div>

      {/* Banner: menunggu QRIS */}
      {txPaymentPending && polling && (
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <Loader2 size={14} className="animate-spin shrink-0" />
          <span>Menunggu konfirmasi pembayaran QRIS… halaman akan otomatis diperbarui.</span>
          {activeQris && (
            <button
              onClick={() => setShowQrisModal(true)}
              className="ml-auto shrink-0 flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition"
            >
              <QrCode size={13} /> Lihat QR
            </button>
          )}
        </div>
      )}

      {/* Banner: QRIS expired — tawarkan retry */}
      {txPaymentFailed && isNeedTxReview && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <XCircle size={14} className="shrink-0" />
          <span>QRIS expired atau pembayaran gagal. Generate QRIS baru untuk melanjutkan.</span>
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="ml-auto shrink-0 flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition"
          >
            {retrying
              ? <Loader2 size={12} className="animate-spin" />
              : <RefreshCw size={12} />}
            Bayar Ulang
          </button>
        </div>
      )}

      <div className={`grid gap-6 items-start ${hasTxPanel ? "lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* ── Kolom Kiri ── */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card shadow-sm divide-y text-sm">
            <InfoRow icon={<CalendarDays size={13} />} label="Tanggal"
              value={new Date(booking.booking_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
            {booking.booking_time && <InfoRow label="Waktu" value={booking.booking_time} />}
            <InfoRow icon={<Users size={13} />} label="Jumlah Pax" value={`${booking.pax_count} orang`} />
            {booking.tourist_nationality && <InfoRow label="Kewarganegaraan" value={booking.tourist_nationality} />}
            {booking.booking_type === "package" && booking.package_price_snapshot && (
              <InfoRow icon={<Package size={13} />} label="Harga / Pax" value={formatRupiah(booking.package_price_snapshot)} />
            )}
            {booking.booking_type === "package" && booking.subtotal_package && (
              <InfoRow icon={<Package size={13} />} label="Subtotal Package" value={formatRupiah(booking.subtotal_package)} />
            )}
            {booking.checkin_at && (
              <InfoRow icon={<MapPin size={13} />} label="Checkin" value={new Date(booking.checkin_at).toLocaleString("id-ID")} />
            )}
            {booking.receipt_uploaded_at && (
              <InfoRow icon={<Upload size={13} />} label="Transaksi disubmit" value={new Date(booking.receipt_uploaded_at).toLocaleString("id-ID")} />
            )}
          </div>

          <PhotoGrid urls={txPhotos} label="Bukti Kunjungan dari Guide" />

          {booking.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">Catatan dari Guide</p>
              <p className="bg-muted/30 rounded-lg px-3 py-2">{booking.notes}</p>
            </div>
          )}
          {booking.status === "rejected" && booking.vendor_rejection_reason && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">Alasan Penolakan Booking</p>
              <p className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400">{booking.vendor_rejection_reason}</p>
            </div>
          )}
          {booking.status === "cancelled" && booking.cancelled_reason && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">Alasan Pembatalan</p>
              <p className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 text-orange-400">{booking.cancelled_reason}</p>
            </div>
          )}

          {actionError && <p className="text-xs text-red-500">{actionError}</p>}

          <div className="flex flex-wrap gap-3">
            {/* ─ Approve / Tolak booking ─ */}
            {isPending && !showReject && (
              <>
                <Button variant="destructive" onClick={() => setShowReject(true)}><XCircle size={14} className="mr-1" /> Tolak</Button>
                <Button onClick={handleApprove} disabled={submitting}>
                  <CheckCircle size={14} className="mr-1" />{submitting ? "Menyetujui..." : "Setujui"}
                </Button>
              </>
            )}
            {isPending && showReject && (
              <div className="w-full space-y-2">
                <Label>Alasan Penolakan <span className="text-red-500">*</span></Label>
                <Textarea value={rejectReason} onChange={e => { setRejectReason(e.target.value); setActionError("") }} rows={3} placeholder="Tuliskan alasan..." />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowReject(false)}>Batal</Button>
                  <Button variant="destructive" onClick={handleReject} disabled={submitting}>{submitting ? "Menolak..." : "Konfirmasi Tolak"}</Button>
                </div>
              </div>
            )}

            {/* ─ Checkin ─ */}
            {isConfirmed && (
              <Button onClick={handleCheckin} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MapPin size={14} className="mr-1" />{submitting ? "Memproses..." : "Checkin Guide"}
              </Button>
            )}

            {/* ─ Approve transaksi: tombol awal ─ */}
            {isNeedTxReview && txPendingApproval && !showPayConfirm && !showTxReject && (
              <>
                <Button variant="destructive" onClick={() => setShowTxReject(true)} disabled={submitting}>
                  <XCircle size={14} className="mr-1" /> Tolak Transaksi
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setShowPayConfirm(true)}
                  disabled={submitting || qrisBlocked || qrisLoading}
                  title={qrisBlocked ? "Rekening settlement guide belum terdaftar" : undefined}
                >
                  {qrisLoading
                    ? <><Loader2 size={14} className="mr-1 animate-spin" /> Memeriksa...</>
                    : <><CheckCircle2 size={14} className="mr-1" /> Approve Transaksi</>}
                </Button>
              </>
            )}

            {/* ─ Warning settlement sebelum form konfirmasi QRIS ─ */}
            {isNeedTxReview && txPendingApproval && !showPayConfirm && !showTxReject && qrisBlocked && (
              <div className="w-full">
                <SettlementWarningBanner />
              </div>
            )}

            {/* ─ Konfirmasi bayar via QRIS ─ */}
            {isNeedTxReview && txPendingApproval && showPayConfirm && (
              <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-400" />
                  <p className="text-sm font-medium">Bayar via QRIS</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sistem akan generate QRIS DOKU. Scan QR untuk menyelesaikan pembayaran komisi guide + fee platform.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowPayConfirm(false)} disabled={submitting}>
                    Batal
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleTxApproveQris}
                    disabled={submitting || qrisBlocked}
                    title={qrisBlocked ? "Rekening settlement guide belum terdaftar" : undefined}
                  >
                    {submitting
                      ? <><Loader2 size={14} className="mr-1 animate-spin" /> Membuat QRIS...</>
                      : <><QrCode size={14} className="mr-1" /> Generate & Bayar QRIS</>}
                  </Button>
                </div>
                {/* Warning di dalam panel konfirmasi jika settlement belum ada */}
                {qrisBlocked && (
                  <SettlementWarningBanner />
                )}
              </div>
            )}

            {/* ─ Tolak transaksi form ─ */}
            {isNeedTxReview && txPendingApproval && showTxReject && (
              <div className="w-full space-y-2">
                <Label>Alasan Penolakan Transaksi <span className="text-red-500">*</span></Label>
                <Textarea value={txRejectReason} onChange={e => { setTxRejectReason(e.target.value); setActionError("") }} rows={3} placeholder="Tuliskan alasan..." />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowTxReject(false)}>Batal</Button>
                  <Button variant="destructive" onClick={handleTxReject} disabled={submitting}>{submitting ? "Menolak..." : "Konfirmasi Tolak"}</Button>
                </div>
              </div>
            )}

            {/* ─ Bayar Ulang (QRIS failed) ─ */}
            {isNeedTxReview && txPaymentFailed && (
              <Button
                onClick={handleRetryPayment}
                disabled={retrying}
                className="bg-orange-500 hover:bg-orange-400 text-black font-semibold"
              >
                {retrying
                  ? <><Loader2 size={14} className="mr-1 animate-spin" /> Membuat QRIS...</>
                  : <><RefreshCw size={14} className="mr-1" /> Bayar Ulang (QRIS Baru)</>}
              </Button>
            )}
          </div>
        </div>

        {/* ── Kolom Kanan: Detail Transaksi ── */}
        {hasTxPanel && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold flex items-center gap-1.5 text-muted-foreground">
              <Receipt size={16} /> Detail Transaksi
            </h2>
            <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Receipt size={15} className="text-emerald-400" />
                <span className="text-sm font-semibold">#{tx!.transaction_code}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {tx!.status === "pending_vendor_approval" ? "Menunggu Approval" :
                   tx!.status === "settled"         ? "Settled" :
                   tx!.status === "payment_pending" ? "Menunggu Bayar" :
                   tx!.status === "payment_failed"  ? "Gagal / Expired" :
                   tx!.status === "rejected"        ? "Ditolak" : tx!.status}
                </Badge>
              </div>

              <div className="rounded-lg border bg-muted/20 divide-y text-sm">
                <div className="px-3 py-2 flex justify-between">
                  <span className="text-muted-foreground">Gross Total</span>
                  <span className="font-bold">{formatRupiah(tx!.gross_amount)}</span>
                </div>
                {tx!.extra_amount && Number(tx!.extra_amount) > 0 && (
                  <div className="px-3 py-2 flex justify-between">
                    <span className="text-muted-foreground">↳ Extra ({tx!.extra_notes || "tambahan"})</span>
                    <span>{formatRupiah(tx!.extra_amount)}</span>
                  </div>
                )}
                <div className="px-3 py-2 flex justify-between">
                  <span className="text-muted-foreground">Bagian Vendor ({tx!.vendor_percent_snapshot}%)</span>
                  <span className="text-blue-400 font-medium">{formatRupiah(tx!.vendor_amount)}</span>
                </div>
                <div className="px-3 py-2 flex justify-between">
                  <span className="text-muted-foreground">Komisi Guide ({tx!.guide_percent_snapshot}%)</span>
                  <span>{formatRupiah(tx!.guide_commission)}</span>
                </div>
                <div className="px-3 py-2 flex justify-between">
                  <span className="text-muted-foreground">Fee Platform ({tx!.platform_percent_snapshot}%)</span>
                  <span>{formatRupiah(tx!.platform_fee)}</span>
                </div>
              </div>

              <div className="rounded-lg border border-orange-500/40 bg-orange-500/5 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Tagihan ke Vendor</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Komisi Guide + Fee Platform</span>
                  <span className="text-lg font-bold text-orange-400">
                    {formatRupiah(Number(tx!.guide_commission) + Number(tx!.platform_fee))}
                  </span>
                </div>
              </div>

              {/* QRIS aktif */}
              {txPaymentPending && activeQris && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    {polling && <Loader2 size={12} className="animate-spin" />}
                    <span>Menunggu pembayaran QRIS — halaman otomatis update setelah lunas.</span>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowQrisModal(true)}>
                    <QrCode size={15} className="mr-2" /> Tampilkan QR Code
                  </Button>
                  {tx?.xendit_invoice_id && (
                    <p className="text-[10px] text-muted-foreground font-mono">Ref DOKU: {tx.xendit_invoice_id}</p>
                  )}
                </div>
              )}

              {/* QRIS expired / failed */}
              {txPaymentFailed && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 space-y-2">
                  <p className="text-xs text-red-300">QRIS sudah expired atau pembayaran gagal.</p>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold"
                    onClick={handleRetryPayment}
                    disabled={retrying}
                  >
                    {retrying
                      ? <><Loader2 size={14} className="mr-1 animate-spin" /> Membuat QRIS baru...</>
                      : <><RefreshCw size={14} className="mr-1" /> Generate QRIS Baru</>}
                  </Button>
                </div>
              )}

              {tx!.vendor_rejection_reason && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Alasan Ditolak</p>
                  <p className="text-red-400">{tx!.vendor_rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(isNeedTxReview || booking.status === "completed") && !tx && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle size={14} /> Data transaksi belum tersedia.
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start px-3 py-2 gap-4">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-xs">{icon}{label}</span>
      <span className={`text-right text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
