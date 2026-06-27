"use client"
import { useEffect, useState, useRef } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { transactionsService, resolveReceiptUrl } from "@/services/transactions.service"
import { API_BASE_URL } from "@/lib/constants"
import { getTokens } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle, Upload, Eye, CalendarDays, Users, FileText,
  MapPin, CheckCircle2, ImageIcon, Receipt, X, Plus,
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
  pending_receipt:    "Submit Transaksi",
  pending_completion: "Menunggu Konfirmasi Vendor",
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

function Row({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start px-3 py-2 gap-4">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-xs">{icon}{label}</span>
      <span className={`text-right text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}

interface FilePreview {
  file: File
  url: string
}

export default function GuideBookingsPage() {
  const [bookings,   setBookings]   = useState<Booking[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { query, setQuery, filtered } = useTableSearch(bookings)

  const [detailBook,   setDetailBook]   = useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError,  setCancelError]  = useState("")
  const [viewReason,   setViewReason]   = useState<string | null>(null)

  const [txTarget,     setTxTarget]     = useState<Booking | null>(null)
  const [txFiles,      setTxFiles]      = useState<FilePreview[]>([])
  const [txGross,      setTxGross]      = useState("")
  const [txExtra,      setTxExtra]      = useState("")
  const [txExtraNotes, setTxExtraNotes] = useState("")
  const [txNotes,      setTxNotes]      = useState("")
  const [txError,      setTxError]      = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bookingsService.list()
      .then(setBookings)
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [])

  const openTxDialog = (b: Booking) => {
    setTxTarget(b)
    setTxFiles([])
    setTxGross(b.subtotal_package ? String(Number(b.subtotal_package)) : "")
    setTxExtra(""); setTxExtraNotes(""); setTxNotes(""); setTxError("")
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const previews: FilePreview[] = picked.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setTxFiles(prev => [...prev, ...previews])
    setTxError("")
    e.target.value = ""
  }

  const removeFile = (idx: number) => {
    setTxFiles(prev => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const grossNum  = parseFloat(txGross)  || 0
  const extraNum  = parseFloat(txExtra)  || 0
  const totalNum  = grossNum

  const submitTransaction = async () => {
    if (!txTarget) return
    if (txFiles.length === 0) { setTxError("Minimal 1 foto bukti kunjungan wajib diupload."); return }
    if (!txGross || isNaN(grossNum) || grossNum <= 0) { setTxError("Nominal transaksi wajib diisi dan harus > 0."); return }

    if (txTarget.booking_type === "package" && txTarget.subtotal_package) {
      const expected = Number(txTarget.subtotal_package) + extraNum
      if (Math.abs(grossNum - expected) > 0.01) {
        setTxError(`Nominal harus = subtotal package ${formatRupiah(txTarget.subtotal_package)} + extra ${formatRupiah(extraNum)} = ${formatRupiah(expected)}`)
        return
      }
    }

    setSubmitting(true)
    try {
      let allPaths: string[] = []
      if (txFiles.length > 1) {
        const { access } = getTokens()
        const form = new FormData()
        txFiles.slice(1).forEach(fp => form.append('files', fp.file))
        const res = await fetch(`${API_BASE_URL}/uploads/batch`, {
          method: 'POST',
          headers: access ? { Authorization: `Bearer ${access}` } : {},
          body: form,
        })
        if (res.ok) {
          const data = await res.json() as { uploaded: { url: string }[] }
          allPaths = data.uploaded.map(u => u.url)
        }
      }

      const extraPhotosNote = allPaths.length > 0 ? `\n[extra_photos:${JSON.stringify(allPaths)}]` : ""
      const finalNotes = ((txNotes || "") + extraPhotosNote) || undefined

      await transactionsService.submitTransaction(txTarget.id, {
        receiptFile:  txFiles[0].file,
        grossAmount:  grossNum,
        extraAmount:  txExtra ? extraNum : undefined,
        extraNotes:   txExtraNotes || undefined,
        receiptNotes: finalNotes,
      })

      setBookings(prev => prev.map(b =>
        b.id === txTarget.id ? { ...b, status: "pending_completion" } : b
      ))
      setTxTarget(null)
    } catch (err: unknown) {
      const detail = (err as { detail?: string })?.detail
      setTxError(detail ?? "Gagal submit transaksi. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

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

  const isPackage = txTarget?.booking_type === "package"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Semua booking yang kamu buat.</p>
        </div>
        <Button asChild><Link href="/guide/bookings/create">+ Buat Booking</Link></Button>
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
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Detail</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada booking."}
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => setDetailBook(b)}>
                    <Eye size={13} className="mr-1" /> Lihat Detail
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {b.status === "pending_receipt" && (
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => openTxDialog(b)}>
                        <Receipt size={13} className="mr-1" /> Submit Transaksi
                      </Button>
                    )}
                    {["pending_vendor","confirmed","pending_receipt","pending_completion"].includes(b.status) && (
                      <Button size="sm" variant="outline" className="text-red-500 border-red-300 hover:bg-red-50"
                        onClick={() => { setCancelTarget(b.id); setCancelReason(""); setCancelError("") }}>
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

      {/* ===== Detail Modal ===== */}
      <Dialog open={!!detailBook} onOpenChange={open => { if (!open) setDetailBook(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={17} /> Detail Booking
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
                <Row icon={<FileText size={12}/>}     label="Kode Booking" value={detailBook.booking_code} mono />
                <Row icon={<CalendarDays size={12}/>} label="Tanggal"       value={new Date(detailBook.booking_date).toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />
                {detailBook.booking_time && <Row label="Waktu" value={detailBook.booking_time} />}
                <Row icon={<Users size={12}/>} label="Jumlah Pax" value={`${detailBook.pax_count} orang`} />
                {detailBook.tourist_nationality && <Row label="Kewarganegaraan" value={detailBook.tourist_nationality} />}
                {detailBook.checkin_at && <Row icon={<MapPin size={12}/>} label="Checkin" value={new Date(detailBook.checkin_at).toLocaleString("id-ID")} />}
                {detailBook.receipt_uploaded_at && <Row icon={<Upload size={12}/>} label="Transaksi disubmit" value={new Date(detailBook.receipt_uploaded_at).toLocaleString("id-ID")} />}
                {detailBook.completed_at && <Row icon={<CheckCircle2 size={12}/>} label="Selesai pada" value={new Date(detailBook.completed_at).toLocaleString("id-ID")} />}
              </div>
              {detailBook.receipt_url && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-2">Bukti Kunjungan</p>
                  <img
                    src={resolveReceiptUrl(detailBook.receipt_url)}
                    alt="Bukti kunjungan"
                    className="rounded-md max-h-48 w-full object-contain bg-black/10"
                    onError={e => { (e.target as HTMLImageElement).style.display='none' }}
                  />
                </div>
              )}
              {detailBook.status === "confirmed" && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
                  <p className="font-medium text-blue-400 mb-1">📋 Instruksi Checkin</p>
                  <p className="text-muted-foreground text-xs">
                    Tunjukkan halaman ini atau kode booking
                    <span className="font-mono font-bold text-foreground mx-1">{detailBook.booking_code}</span>
                    ke petugas vendor saat tiba di lokasi.
                  </p>
                </div>
              )}
              {detailBook.status === "rejected" && detailBook.vendor_rejection_reason && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Alasan Penolakan</p>
                  <p className="text-red-400">{detailBook.vendor_rejection_reason}</p>
                </div>
              )}
              {detailBook.status === "cancelled" && detailBook.cancelled_reason && (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Alasan Pembatalan</p>
                  <p className="text-orange-400">{detailBook.cancelled_reason}</p>
                </div>
              )}
              {detailBook.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Catatan</p>
                  <p className="bg-muted/30 rounded-lg px-3 py-2">{detailBook.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailBook(null)}>Tutup</Button>
            {detailBook?.status === "pending_receipt" && (
              <Button className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => { openTxDialog(detailBook); setDetailBook(null) }}>
                <Receipt size={14} className="mr-1" /> Submit Transaksi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Submit Transaksi Dialog — Bootstrap modal-lg style (800px) ===== */}
      <Dialog open={!!txTarget} onOpenChange={open => { if (!open) setTxTarget(null) }}>
        <DialogContent
          style={{ maxWidth: "800px", width: "100%" }}
          className="p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
            <h5 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" /> Submit Transaksi
            </h5>
          </div>

          {/* Body — scrollable */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>

            {/* Info package */}
            {isPackage && txTarget?.subtotal_package && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Subtotal Package</p>
                <p className="font-bold text-blue-400 text-base">{formatRupiah(txTarget.subtotal_package)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {txTarget.pax_count} pax × {formatRupiah(txTarget.package_price_snapshot)}
                  {" — Tambahkan extra di bawah jika ada biaya di luar package"}
                </p>
              </div>
            )}

            {/* Multi-foto upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto Bukti Kunjungan <span className="text-red-500">*</span>
                <span className="text-muted-foreground text-xs font-normal ml-1">
                  (bisa lebih dari 1 — JPG/PNG/WebP/PDF, maks 5MB per file)
                </span>
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
                    <Plus size={20} className="mb-1" />
                    <span className="text-xs">Tambah</span>
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={36} />
                  <p className="text-sm text-muted-foreground">Klik untuk pilih foto / PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">Bisa memilih lebih dari 1 file sekaligus</p>
                </div>
              )}

              <input ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple className="hidden" onChange={handleFilesChange} />
            </div>

            {/* Nominal gross */}
            <div className="space-y-1">
              <Label htmlFor="tx-gross">Total Nominal Transaksi <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                <Input id="tx-gross" type="number" min="0" placeholder="0" className="pl-9"
                  value={txGross}
                  onChange={e => { setTxGross(e.target.value); setTxError("") }}
                  readOnly={isPackage && extraNum === 0}
                />
              </div>
              {isPackage && <p className="text-xs text-muted-foreground">Package: otomatis = subtotal + extra</p>}
            </div>

            {/* Extra amount */}
            <div className="space-y-1">
              <Label htmlFor="tx-extra">
                Biaya Tambahan di Luar Package
                <span className="text-muted-foreground text-xs font-normal ml-1">(opsional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                <Input id="tx-extra" type="number" min="0" placeholder="0" className="pl-9"
                  value={txExtra}
                  onChange={e => {
                    setTxExtra(e.target.value)
                    setTxError("")
                    if (isPackage && txTarget?.subtotal_package) {
                      const extra = parseFloat(e.target.value) || 0
                      setTxGross(String(Number(txTarget.subtotal_package) + extra))
                    }
                  }}
                />
              </div>
            </div>

            {/* Keterangan extra */}
            {txExtra && parseFloat(txExtra) > 0 && (
              <div className="space-y-1">
                <Label htmlFor="tx-extra-notes">Keterangan Biaya Tambahan</Label>
                <Textarea id="tx-extra-notes" placeholder="Contoh: makan siang, tiket masuk ekstra..." rows={2}
                  value={txExtraNotes} onChange={e => setTxExtraNotes(e.target.value)} />
              </div>
            )}

            {/* Catatan */}
            <div className="space-y-1">
              <Label htmlFor="tx-notes">
                Catatan
                <span className="text-muted-foreground text-xs font-normal ml-1">(opsional)</span>
              </Label>
              <Textarea id="tx-notes" placeholder="Catatan untuk vendor..." rows={2}
                value={txNotes} onChange={e => setTxNotes(e.target.value)} />
            </div>

            {/* Total Transaksi */}
            {totalNum > 0 && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total Transaksi</p>
                  {extraNum > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRupiah(Number(txTarget?.subtotal_package ?? grossNum - extraNum))} + extra {formatRupiah(extraNum)}
                    </p>
                  )}
                </div>
                <span className="text-2xl font-bold text-emerald-400">{formatRupiah(totalNum)}</span>
              </div>
            )}

            {txError && <p className="text-sm text-red-500">{txError}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-card">
            <Button variant="outline" onClick={() => setTxTarget(null)} disabled={submitting}>Batal</Button>
            <Button onClick={submitTransaction} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Receipt size={14} className="mr-1" />
              {submitting ? "Mengupload..." : `Submit Transaksi${txFiles.length > 0 ? ` (${txFiles.length} foto)` : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Batalkan Booking</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason">Alasan Pembatalan <span className="text-red-500">*</span></Label>
            <Textarea id="cancel-reason" placeholder="Tuliskan alasan..." value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError("") }} rows={4} />
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

      {/* View Rejection Reason */}
      <Dialog open={!!viewReason} onOpenChange={open => { if (!open) setViewReason(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Alasan Penolakan</DialogTitle></DialogHeader>
          <div className="py-2"><p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewReason}</p></div>
          <DialogFooter><Button variant="outline" onClick={() => setViewReason(null)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
