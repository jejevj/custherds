"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  bookingReportsService,
  BookingReport,
  REPORT_TYPE_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
} from "@/services/booking-reports.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar, Hash, AlignLeft, StickyNote, CheckCircle2, Clock } from "lucide-react"

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

export default function GuideReportDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [report, setReport] = useState<BookingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    if (!id) return
    bookingReportsService.get(id)
      .then(setReport)
      .catch(() => setError("Laporan tidak ditemukan atau akses ditolak."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-20 text-center text-muted-foreground">Memuat...</div>
  if (error)   return <div className="py-20 text-center text-red-500">{error}</div>
  if (!report) return null

  const bookingDate = report.booking?.booking_date
    ? new Date(report.booking.booking_date).toLocaleDateString("id-ID", { dateStyle: "long" })
    : "-"

  const createdAt = new Date(report.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  const reviewedAt = report.reviewed_at
    ? new Date(report.reviewed_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.push("/guide/reports")}>
        <ArrowLeft size={15} className="mr-1" /> Kembali ke Laporan
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Laporan</h1>
          <p className="text-muted-foreground font-mono text-sm mt-0.5">{report.report_code}</p>
        </div>
        <Badge variant={REPORT_STATUS_VARIANT[report.status] ?? "secondary"} className="text-sm px-3 py-1">
          {REPORT_STATUS_LABEL[report.status] ?? report.status}
        </Badge>
      </div>

      {/* Info Laporan */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informasi Laporan</h2>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Kode Laporan">
            <span className="font-mono">{report.report_code}</span>
          </InfoRow>
          <InfoRow label="Jenis Laporan">
            {REPORT_TYPE_LABEL[report.report_type] ?? report.report_type}
          </InfoRow>
          <InfoRow label="Tanggal Dibuat">
            <span className="flex items-center gap-1"><Clock size={13} />{createdAt}</span>
          </InfoRow>
          {report.transaction?.transaction_code && (
            <InfoRow label="Kode Transaksi">
              <span className="font-mono">{report.transaction.transaction_code}</span>
            </InfoRow>
          )}
        </div>
      </div>

      {/* Info Booking */}
      {report.booking && (
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Booking Terkait</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Kode Booking">
              <span className="font-mono">{report.booking.booking_code}</span>
            </InfoRow>
            <InfoRow label="Tanggal Booking">
              <span className="flex items-center gap-1"><Calendar size={13} />{bookingDate}</span>
            </InfoRow>
            <InfoRow label="Status Booking">
              {report.booking.status}
            </InfoRow>
            {report.booking.vendor_rejection_reason && (
              <InfoRow label="Alasan Penolakan Vendor">
                {report.booking.vendor_rejection_reason}
              </InfoRow>
            )}
          </div>
        </div>
      )}

      {/* Info Transaksi (jika ada) */}
      {report.transaction && (
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Transaksi Terkait</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Kode Transaksi">
              <span className="font-mono">{report.transaction.transaction_code}</span>
            </InfoRow>
            <InfoRow label="Total Transaksi">
              Rp {Number(report.transaction.gross_amount).toLocaleString("id-ID")}
            </InfoRow>
            <InfoRow label="Komisi Guide">
              Rp {Number(report.transaction.guide_commission).toLocaleString("id-ID")}
            </InfoRow>
            <InfoRow label="Status Transaksi">
              {report.transaction.status}
            </InfoRow>
          </div>
        </div>
      )}

      {/* Deskripsi */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <AlignLeft size={14} /> Deskripsi Laporan
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
      </div>

      {/* Resolusi (jika sudah ditinjau) */}
      {(report.status === "resolved" || report.status === "dismissed" || report.resolution_notes) && (
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Hasil Tinjauan Admin
          </h2>
          {reviewedAt && (
            <p className="text-xs text-muted-foreground">Ditinjau pada: {reviewedAt}</p>
          )}
          {report.resolution_notes ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.resolution_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Belum ada catatan resolusi.</p>
          )}
        </div>
      )}
    </div>
  )
}
