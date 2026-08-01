"use client"
import { useEffect, useState } from "react"
import {
  bookingReportsService,
  BookingReport,
  REPORT_TYPE_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
} from "@/services/booking-reports.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTableSearch } from "@/hooks/useTableSearch"
import { TableSearchInput } from "@/components/ui/TableSearchInput"

export default function GuideReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<BookingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  const { query, setQuery, filtered } = useTableSearch(reports)

  useEffect(() => {
    bookingReportsService.list()
      .then(setReports)
      .catch(() => setError("Gagal memuat laporan."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Saya</h1>
        <p className="text-muted-foreground">Daftar laporan booking yang telah kamu ajukan.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <TableSearchInput value={query} onChange={setQuery} placeholder="Cari kode laporan, kode booking..." />
        {query && <p className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} dari {reports.length} hasil</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode Laporan</th>
              <th className="px-4 py-3 font-medium">Kode Booking</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada laporan yang diajukan."}
              </td></tr>
            ) : (filtered as BookingReport[]).map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{r.report_code}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {r.booking?.booking_code ?? "-"}
                </td>
                <td className="px-4 py-3">
                  {REPORT_TYPE_LABEL[r.report_type] ?? r.report_type}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={REPORT_STATUS_VARIANT[r.status] ?? "secondary"}>
                    {REPORT_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/guide/reports/${r.id}`)}>
                    <Eye size={13} className="mr-1" /> Detail
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
