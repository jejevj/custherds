"use client"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  adminReportsService,
} from "@/services/admin-reports.service"
import {
  BookingReport,
  REPORT_TYPE_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
} from "@/services/booking-reports.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const STATUS_TABS = [
  { label: "Semua",          value: "" },
  { label: "Open",           value: "open" },
  { label: "Sedang Ditinjau", value: "in_review" },
  { label: "Selesai",        value: "resolved" },
  { label: "Ditolak",        value: "dismissed" },
]

export default function AdminReportsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status") ?? ""

  const [reports, setReports] = useState<BookingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    setLoading(true)
    adminReportsService
      .list(statusFilter ? { status: statusFilter } : undefined)
      .then(setReports)
      .catch(() => setError("Gagal memuat laporan."))
      .finally(() => setLoading(false))
  }, [statusFilter])

  function setTab(val: string) {
    const params = new URLSearchParams()
    if (val) params.set("status", val)
    router.push(`/admin/reports${val ? `?${params}` : ""}`)
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Masuk</h1>
        <p className="text-muted-foreground">Semua laporan yang diajukan oleh Guide.</p>
      </div>

      {/* Tab Filter Status */}
      <div className="flex gap-1 flex-wrap border-b">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode Laporan</th>
              <th className="px-4 py-3 font-medium">Kode Booking</th>
              <th className="px-4 py-3 font-medium">Guide ID</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Tidak ada laporan.</td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{r.report_code}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.booking?.booking_code ?? "-"}</td>
                <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={r.guide_id}>
                  {r.guide_id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3">{REPORT_TYPE_LABEL[r.report_type] ?? r.report_type}</td>
                <td className="px-4 py-3">
                  <Badge variant={REPORT_STATUS_VARIANT[r.status] ?? "secondary"}>
                    {REPORT_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/admin/reports/${r.id}`)}>
                    <Eye size={13} className="mr-1" /> Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
