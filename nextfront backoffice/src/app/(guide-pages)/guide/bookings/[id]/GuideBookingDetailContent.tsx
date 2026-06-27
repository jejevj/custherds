"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { bookingsService, Booking } from "@/services/bookings.service"
import { transactionsService, Transaction, resolveReceiptUrl } from "@/services/transactions.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft, FileText, CalendarDays, Users, Package, MapPin,
  Upload, Receipt, Clock, Banknote, TrendingUp, ImageIcon,
  Image as ImageIcon2, CheckCircle2, AlertTriangle,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Plus, AlertCircle,
} from "lucide-react"

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
  pending_receipt: "Submit Transaksi",
  pending_completion: "Menunggu Konfirmasi Vendor",
  completed: "Selesai",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
}

function canCancel(b: Booking): boolean {
  return ["pending_vendor", "confirmed", "pending_receipt"].includes(b.status) && !b.checkin_at
}

function formatRupiah(n?: number | string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

/**
 * Parse extra_photos dari receipt_notes.
 * Format DB: [extra_photos:["/api/v1/uploads/xxx.jpg","/api/v1/uploads/yyy.png"]]
 * Gunakan JSON.parse agar path dengan karakter khusus tetap aman.
 */
function parseExtraPhotos(notes: string | null | undefined): string[] {
  if (!notes) return []
  const tag = "[extra_photos:"
  const start = notes.indexOf(tag)
  if (start === -1) return []
  const sub = notes.slice(start + tag.length) // dimulai tepat di '['
  // Cari posisi ']' penutup array JSON
  const end = sub.indexOf("]")
  if (end === -1) return []
  try {
    return JSON.parse(sub.slice(0, end + 1)) as string[]
  } catch {
    return []
  }
}

function InfoRow({ icon, label, value, mono, highlight }: {
  icon?: React.ReactNode; label: string; value: string; mono?: boolean; highlight?: "green" | "amber"
}) {
  const valClass = highlight === "green"
    ? "text-right text-sm font-bold text-emerald-400"
    : highlight === "amber"
    ? "text-right text-sm font-semibold text-amber-400"
    : `text-right text-sm ${mono ? "font-mono text-xs" : ""}`
  return (
    <div className="flex justify-between items-start px-3 py-2 gap-4">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-xs">{icon}{label}</span>
      <span className={valClass}>{value}</span>
    </div>
  )
}

// ── Attempt Banner ────────────────────────────────────────────────────────────
function TxAttemptBanner({ attempt, max }: { attempt: number; max: number }) {
  if (attempt === 0) return null
  const remaining = max - attempt
  const isLast    = remaining === 1
  const isFinal   = remaining <= 0
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
      isFinal ? "border-red-500/40 bg-red-500/10"
      : isLast ? "border-orange-500/40 bg-orange-500/10"
      : "border-yellow-500/30 bg-yellow-500/5"
    }`}>
      <AlertCircle size={16} className={`shrink-0 mt-0.5 ${
        isFinal ? "text-red-400" : isLast ? "text-orange-400" : "text-yellow-400"
      }`} />
      <div>
        <p className={`font-semibold ${
          isFinal ? "text-red-400" : isLast ? "text-orange-400" : "text-yellow-400"
        }`}>
          Percobaan {attempt} dari {max}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isFinal
            ? "Transaksi sudah ditolak 3x. Booking ini telah ditutup."
            : `Transaksi kamu ditolak vendor. Kamu masih bisa submit ulang ${remaining}x lagi.`
          }
        </p>
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx]   = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const touchStartX     = useRef<number | null>(null)

  const prev = useCallback(() => { setIdx(i => (i - 1 + images.length) % images.length); setZoom(1) }, [images.length])
  const next = useCallback(() => { setIdx(i => (i + 1) % images.length); setZoom(1) }, [images.length])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.stopPropagation(); prev() }
      if (e.key === "ArrowRight") { e.stopPropagation(); next() }
      if (e.key === "Escape")     { e.stopPropagation(); e.preventDefault(); onClose() }
    }
    window.addEventListener("keydown", h, true)
    return () => window.removeEventListener("keydown", h, true)
  }, [prev, next, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
        touchStartX.current = null
      }}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/70 text-sm">{idx + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><ZoomOut size={18} /></button>
          <span className="text-white/70 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><ZoomIn size={18} /></button>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 ml-2"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {images.length > 1 && <button onClick={prev} className="absolute left-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"><ChevronLeft size={24} /></button>}
        <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
          <img key={images[idx]} src={images[idx]} alt={`Foto ${idx + 1}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}
            className="max-h-[75vh] max-w-[80vw] object-contain rounded select-none" draggable={false} />
        </div>
        {images.length > 1 && <button onClick={next} className="absolute right-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"><ChevronRight size={24} /></button>}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 justify-center px-4 py-3 shrink-0 overflow-x-auto">
          {images.map((src, i) => (
            <button key={i} onClick={() => { setIdx(i); setZoom(1) }}
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

interface FilePreview { file: File; url: string }

// ── Main Component ────────────────────────────────────────────────────────────
export default function GuideBookingDetailContent() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [booking,    setBooking]   = useState<Booking | null>(null)
  const [tx,         setTx]        = useState<Transaction | null>(null)
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex,  setLightboxIndex]  = useState(0)

  const [showCancel,   setShowCancel]   = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError,  setCancelError]  = useState("")

  const [showTxForm,   setShowTxForm]   = useState(false)
  const [txFiles,      setTxFiles]      = useState<FilePreview[]>([])
  const [txGross,      setTxGross]      = useState("")
  const [txExtra,      setTxExtra]      = useState("")
  const [txExtraNotes, setTxExtraNotes] = useState("")
  const [txNotes,      setTxNotes]      = useState("")
  const [txError,      setTxError]      = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const b = await bookingsService.get(id)
      setBooking(b)
      const needTx = ["pending_completion", "completed", "pending_receipt"].includes(b.status)
      if (needTx) {
        try {
          const found = await transactionsService.getByBookingId(b.id)
          setTx(found)
        } catch { setTx(null) }
      } else {
        setTx(null)
      }
    } catch {
      setError("Gagal memuat detail booking.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const openTxForm = () => {
    setShowTxForm(true)
    setTxFiles([])
    setTxGross(booking?.subtotal_package ? String(Number(booking.subtotal_package)) : "")
    setTxExtra(""); setTxExtraNotes(""); setTxNotes(""); setTxError("")
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    setTxFiles(prev => [...prev, ...picked.map(f => ({ file: f, url: URL.createObjectURL(f) }))])
    setTxError("")
    e.target.value = ""
  }

  const removeFile = (i: number) => {
    setTxFiles(prev => { URL.revokeObjectURL(prev[i].url); return prev.filter((_, j) => j !== i) })
  }

  const grossNum  = parseFloat(txGross) || 0
  const extraNum  = parseFloat(txExtra) || 0
  const isPackage = booking?.booking_type === "package"

  const submitTransaction = async () => {
    if (!booking) return
    if (txFiles.length === 0) { setTxError("Minimal 1 foto bukti kunjungan wajib diupload."); return }
    if (!txGross || isNaN(grossNum) || grossNum <= 0) { setTxError("Nominal transaksi wajib diisi dan harus > 0."); return }
    if (isPackage && booking.subtotal_package) {
      const expected = Number(booking.subtotal_package) + extraNum
      if (Math.abs(grossNum - expected) > 0.01) {
        setTxError(`Nominal harus = subtotal ${formatRupiah(booking.subtotal_package)} + extra ${formatRupiah(extraNum)} = ${formatRupiah(expected)}`)
        return
      }
    }
    setSubmitting(true)
    try {
      await transactionsService.submitTransaction(booking.id, {
        receiptFiles: txFiles.map(fp => fp.file),
        grossAmount: grossNum,
        extraAmount: txExtra ? extraNum : undefined,
        extraNotes: txExtraNotes || undefined,
        receiptNotes: txNotes || undefined,
      })
      await fetchData()
      setShowTxForm(false)
    } catch (err: unknown) {
      setTxError((err as { detail?: string })?.detail ?? "Gagal submit transaksi. Coba lagi.")
    } finally { setSubmitting(false) }
  }

  const submitCancel = async () => {
    if (!booking) return
    if (!cancelReason.trim()) { setCancelError("Alasan pembatalan wajib diisi."); return }
    setSubmitting(true)
    try {
      await bookingsService.cancel(booking.id, cancelReason.trim())
      setBooking(prev => prev ? { ...prev, status: "cancelled", cancelled_reason: cancelReason.trim() } : prev)
      setShowCancel(false)
    } catch { setCancelError("Gagal membatalkan booking. Coba lagi.") }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Memuat...</div>
  if (error || !booking) return <div className="p-8 text-red-400">{error || "Booking tidak ditemukan."}</div>

  const allReceiptPhotos: string[] = [
    ...(tx?.receipt_image ? [resolveReceiptUrl(tx.receipt_image)] : []),
    ...parseExtraPhotos(tx?.receipt_notes).map(p => resolveReceiptUrl(p)),
  ]

  const showTxPanel = ["pending_completion", "completed"].includes(booking.status)
  const showRejectedTxPhotos = booking.status === "pending_receipt" && tx?.status === "rejected" && allReceiptPhotos.length > 0

  const komisiBadge = tx?.guide_commission && tx.status !== "rejected"
    ? { label: "Komisi Kamu", value: formatRupiah(tx.guide_commission), real: true }
    : booking.estimated_commission
    ? { label: "Estimasi Komisi", value: formatRupiah(booking.estimated_commission), real: false }
    : null

  const txAttempt    = booking.tx_attempt ?? 0
  const txAttemptMax = booking.tx_attempt_max ?? 3
  const isRejectedByTx = booking.status === "rejected" && txAttempt >= txAttemptMax

  return (
    <div className="space-y-6">
      {lightboxImages.length > 0 && (
        <Lightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxImages([])} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => router.push("/guide/bookings")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-2"
          >
            <ArrowLeft size={15} /> Kembali ke Daftar Booking
          </button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText size={20} /> Detail Booking
          </h1>
          <p className="text-muted-foreground font-mono text-sm">{booking.booking_code}</p>
        </div>
        <Badge variant={STATUS_VARIANT[booking.status] ?? "secondary"} className="text-sm px-3 py-1 self-start">
          {STATUS_LABEL[booking.status] ?? booking.status}
        </Badge>
      </div>

      {/* Banner percobaan */}
      <TxAttemptBanner attempt={txAttempt} max={txAttemptMax} />

      {/* Content Grid */}
      <div className={`grid gap-6 ${ showTxPanel ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1" }`}>

        {/* Kolom Kiri */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card shadow-sm divide-y text-sm">
            <InfoRow icon={<FileText size={12}/>}     label="Kode Booking"   value={booking.booking_code} mono />
            <InfoRow icon={<CalendarDays size={12}/>} label="Tanggal"         value={new Date(booking.booking_date).toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />
            {booking.booking_time && <InfoRow label="Waktu" value={booking.booking_time} />}
            <InfoRow icon={<Users size={12}/>}        label="Jumlah Pax"     value={`${booking.pax_count} orang`} />
            {booking.tourist_nationality && <InfoRow label="Kewarganegaraan" value={booking.tourist_nationality} />}
            {booking.booking_type === "package" && booking.package_price_snapshot && (
              <InfoRow icon={<Package size={12}/>} label="Harga / Pax" value={formatRupiah(booking.package_price_snapshot)} />
            )}
            {booking.checkin_at && (
              <InfoRow icon={<MapPin size={12}/>} label="Checkin" value={new Date(booking.checkin_at).toLocaleString("id-ID")} />
            )}
            {booking.receipt_uploaded_at && (
              <InfoRow icon={<Upload size={12}/>} label="Transaksi disubmit" value={new Date(booking.receipt_uploaded_at).toLocaleString("id-ID")} />
            )}
            {booking.completed_at && (
              <InfoRow icon={<CheckCircle2 size={12}/>} label="Selesai pada" value={new Date(booking.completed_at).toLocaleString("id-ID")} />
            )}
          </div>

          {/* Komisi card */}
          {komisiBadge && !showTxPanel && (
            <div className={`rounded-xl border px-4 py-3 ${
              komisiBadge.real ? "border-emerald-500/40 bg-emerald-500/5" : "border-emerald-500/20 bg-emerald-500/5"
            }`}>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <TrendingUp size={11} /> {komisiBadge.label}
                {!komisiBadge.real && <span className="ml-1 text-amber-400/80">(estimasi, final setelah tx dikonfirmasi)</span>}
              </p>
              <p className={`text-lg font-bold ${ komisiBadge.real ? "text-emerald-400" : "text-emerald-300" }`}>
                {komisiBadge.value}
              </p>
            </div>
          )}

          {booking.status === "confirmed" && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
              <p className="font-medium text-blue-400 mb-1">📋 Instruksi Checkin</p>
              <p className="text-muted-foreground text-xs">
                Tunjukkan kode booking
                <span className="font-mono font-bold text-foreground mx-1">{booking.booking_code}</span>
                ke petugas vendor saat tiba.
              </p>
            </div>
          )}

          {/* Pending receipt setelah reject: warning + foto lama sebagai referensi */}
          {booking.status === "pending_receipt" && txAttempt > 0 && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-sm flex items-start gap-2">
              <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-orange-400">Transaksi Ditolak Vendor</p>
                {tx?.vendor_rejection_reason && (
                  <p className="text-xs text-orange-300/80 mt-0.5 italic">"{tx.vendor_rejection_reason}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Silakan submit ulang dengan bukti yang lebih jelas.
                  Sisa percobaan: <span className="font-semibold text-orange-300">{txAttemptMax - txAttempt}x</span>
                </p>

                {showRejectedTxPhotos && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <ImageIcon2 size={11} /> Foto yang ditolak ({allReceiptPhotos.length} foto — referensi):
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {allReceiptPhotos.map((src, i) => (
                        <button key={i} type="button"
                          onClick={() => { setLightboxImages(allReceiptPhotos); setLightboxIndex(i) }}
                          className="relative rounded-md overflow-hidden border border-orange-500/30 aspect-square hover:opacity-90 transition group">
                          <img src={src} alt={`foto-lama-${i+1}`} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded">{i + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.status === "pending_completion" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm flex items-start gap-2">
              <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-400">Menunggu Konfirmasi Vendor</p>
                <p className="text-xs text-muted-foreground mt-0.5">Transaksi sudah disubmit. Vendor sedang memverifikasi bukti kunjungan.</p>
              </div>
            </div>
          )}

          {isRejectedByTx && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertCircle size={11} /> Booking Ditutup</p>
              <p className="text-red-400 font-medium">Transaksi ditolak 3x oleh vendor.</p>
              {booking.vendor_rejection_reason && (
                <p className="text-xs text-muted-foreground mt-1">{booking.vendor_rejection_reason}</p>
              )}
            </div>
          )}

          {booking.status === "rejected" && !isRejectedByTx && booking.vendor_rejection_reason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Alasan Penolakan</p>
              <p className="text-red-400">{booking.vendor_rejection_reason}</p>
            </div>
          )}

          {booking.status === "cancelled" && booking.cancelled_reason && (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Alasan Pembatalan</p>
              <p className="text-orange-400">{booking.cancelled_reason}</p>
            </div>
          )}

          {booking.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">Catatan</p>
              <p className="bg-muted/30 rounded-lg px-3 py-2">{booking.notes}</p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {booking.status === "pending_receipt" && (
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={openTxForm}>
                <Receipt size={14} className="mr-1" />
                {txAttempt > 0 ? `Submit Ulang (${txAttemptMax - txAttempt}x tersisa)` : "Submit Transaksi"}
              </Button>
            )}
            {canCancel(booking) && (
              <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50"
                onClick={() => { setShowCancel(true); setCancelReason(""); setCancelError("") }}>
                Batalkan Booking
              </Button>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Detail Transaksi aktif */}
        {showTxPanel && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold flex items-center gap-1.5 text-muted-foreground">
              <Receipt size={16} /> Detail Transaksi
            </h2>
            {tx ? (
              <>
                <div className="rounded-xl border bg-card shadow-sm divide-y text-sm">
                  <InfoRow icon={<FileText size={12}/>}   label="Kode Transaksi" value={tx.transaction_code} mono />
                  <InfoRow icon={<Banknote size={12}/>}   label="Gross Total"    value={formatRupiah(tx.gross_amount)} />
                  {tx.extra_amount && Number(tx.extra_amount) > 0 && (
                    <InfoRow label="Biaya Tambahan" value={formatRupiah(tx.extra_amount)} />
                  )}
                  {tx.extra_notes && <InfoRow label="Ket. Extra" value={tx.extra_notes} />}
                  <InfoRow icon={<TrendingUp size={12}/>} label="Komisi Kamu"    value={formatRupiah(tx.guide_commission)} highlight="green" />
                  {Number(tx.guide_percent_snapshot) > 0 && (
                    <InfoRow label="Persentase Komisi" value={`${Number(tx.guide_percent_snapshot)}%`} highlight="amber" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status transaksi:</span>
                  <Badge variant={
                    tx.status === "settled" ? "default"
                    : tx.status === "rejected" ? "destructive" : "secondary"
                  } className="text-xs">
                    {tx.status === "pending_vendor_approval" ? "Menunggu Konfirmasi Vendor"
                      : tx.status === "payment_pending" ? "Menunggu Pembayaran"
                      : tx.status === "settled" ? "Selesai"
                      : tx.status === "rejected" ? "Ditolak Vendor"
                      : tx.status}
                  </Badge>
                </div>

                {allReceiptPhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ImageIcon2 size={12} /> Foto Bukti Kunjungan
                      <span className="ml-1 text-white/50">({allReceiptPhotos.length} foto — klik untuk lihat)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {allReceiptPhotos.map((src, i) => (
                        <button key={i} type="button"
                          onClick={() => { setLightboxImages(allReceiptPhotos); setLightboxIndex(i) }}
                          className="relative rounded-lg overflow-hidden border aspect-square hover:opacity-90 hover:ring-2 hover:ring-white/40 transition-all group">
                          <img src={src} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{i + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tx.receipt_notes && !tx.receipt_notes.includes("[extra_photos:") && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Catatan Transaksi</p>
                    <p className="bg-muted/30 rounded-lg px-3 py-2 text-xs">{tx.receipt_notes}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                Data transaksi belum tersedia.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Transaksi Dialog */}
      <Dialog open={showTxForm} onOpenChange={open => { if (!open) setShowTxForm(false) }}>
        <DialogContent className="sm:max-w-[700px] w-full p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
            <h5 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              {txAttempt > 0 ? `Submit Ulang Transaksi (Percobaan ${txAttempt + 1}/${txAttemptMax})` : "Submit Transaksi"}
            </h5>
          </div>
          <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {txAttempt > 0 && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-sm flex items-start gap-2">
                <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-orange-400">Transaksi sebelumnya ditolak</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pastikan foto bukti kunjungan jelas dan nominal sesuai.
                    Percobaan tersisa: <span className="font-semibold">{txAttemptMax - txAttempt}x</span>
                  </p>
                </div>
              </div>
            )}

            {isPackage && booking?.subtotal_package && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Subtotal Package</p>
                <p className="font-bold text-blue-400 text-base">{formatRupiah(booking.subtotal_package)}</p>
                {booking.estimated_commission && (
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} /> Estimasi komisi kamu: {formatRupiah(booking.estimated_commission)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {booking.pax_count} pax × {formatRupiah(booking.package_price_snapshot)}
                  {" — Tambahkan extra di bawah jika ada biaya di luar package"}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto Bukti Kunjungan <span className="text-red-500">*</span>
                <span className="text-muted-foreground text-xs font-normal ml-1">(bisa lebih dari 1 — JPG/PNG/WebP/PDF, maks 5MB/file)</span>
              </Label>
              {txFiles.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {txFiles.map((fp, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border bg-muted/20 aspect-square">
                      {fp.file.type === "application/pdf" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-xs text-muted-foreground p-2">
                          <FileText size={24} className="mb-1" />
                          <span className="truncate w-full text-center">{fp.file.name}</span>
                        </div>
                      ) : (
                        <img src={fp.url} alt={`foto-${idx+1}`} className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                        {fp.file.name}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center text-muted-foreground hover:border-amber-400 hover:text-amber-400 transition-colors">
                    <Plus size={20} className="mb-1" /><span className="text-xs">Tambah</span>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={36} />
                  <p className="text-sm text-muted-foreground">Klik untuk pilih foto / PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">Bisa memilih lebih dari 1 file sekaligus</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple className="hidden" onChange={handleFilesChange} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tx-gross">Total Nominal Transaksi <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                <Input id="tx-gross" type="number" min="0" placeholder="0" className="pl-9"
                  value={txGross} onChange={e => { setTxGross(e.target.value); setTxError("") }}
                  readOnly={isPackage && extraNum === 0} />
              </div>
              {isPackage && <p className="text-xs text-muted-foreground">Package: otomatis = subtotal + extra</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="tx-extra">Biaya Tambahan <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                <Input id="tx-extra" type="number" min="0" placeholder="0" className="pl-9"
                  value={txExtra}
                  onChange={e => {
                    setTxExtra(e.target.value); setTxError("")
                    if (isPackage && booking?.subtotal_package)
                      setTxGross(String(Number(booking.subtotal_package) + (parseFloat(e.target.value) || 0)))
                  }} />
              </div>
            </div>

            {txExtra && parseFloat(txExtra) > 0 && (
              <div className="space-y-1">
                <Label htmlFor="tx-extra-notes">Keterangan Biaya Tambahan</Label>
                <Textarea id="tx-extra-notes" placeholder="Contoh: makan siang, tiket masuk ekstra..." rows={2}
                  value={txExtraNotes} onChange={e => setTxExtraNotes(e.target.value)} />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="tx-notes">Catatan <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
              <Textarea id="tx-notes" placeholder="Catatan untuk vendor..." rows={2}
                value={txNotes} onChange={e => setTxNotes(e.target.value)} />
            </div>

            {grossNum > 0 && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total Transaksi</p>
                  {extraNum > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRupiah(Number(booking?.subtotal_package ?? grossNum - extraNum))} + extra {formatRupiah(extraNum)}
                    </p>
                  )}
                </div>
                <span className="text-2xl font-bold text-emerald-400">{formatRupiah(grossNum)}</span>
              </div>
            )}

            {txError && <p className="text-sm text-red-500">{txError}</p>}
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-card">
            <Button variant="outline" onClick={() => setShowTxForm(false)} disabled={submitting}>Batal</Button>
            <Button onClick={submitTransaction} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Receipt size={14} className="mr-1" />
              {submitting ? "Mengupload..." : `Submit Transaksi${txFiles.length > 0 ? ` (${txFiles.length} foto)` : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={open => { if (!open) setShowCancel(false) }}>
        <DialogContent>
          <div className="px-6 pt-6 pb-2">
            <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Batalkan Booking
            </h5>
            <Label htmlFor="cancel-reason">Alasan Pembatalan <span className="text-red-500">*</span></Label>
            <Textarea id="cancel-reason" placeholder="Tuliskan alasan..." value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError("") }} rows={4} className="mt-2" />
            {cancelError && <p className="text-sm text-red-500 mt-1">{cancelError}</p>}
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setShowCancel(false)} disabled={submitting}>Kembali</Button>
            <Button variant="destructive" onClick={submitCancel} disabled={submitting}>
              {submitting ? "Membatalkan..." : "Ya, Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
