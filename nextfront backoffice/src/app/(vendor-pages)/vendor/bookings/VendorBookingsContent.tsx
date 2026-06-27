"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useTableSearch } from "@/hooks/useTableSearch"
import { TableSearchInput } from "@/components/ui/TableSearchInput"

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

export default function VendorBookingsContent() {
  const params = useSearchParams()
  const router = useRouter()
  const status = params.get("status") ?? undefined

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { query, setQuery, filtered } = useTableSearch(bookings)

  useEffect(() => {
    bookingsService.list()
      .then(d => setBookings(status ? d.filter(b => b.status === status) : d))
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "pending_vendor" ? "Bookings — Pending Approval"
          : status === "pending_completion" ? "Bookings — Perlu Review Transaksi"
          : "All Bookings"}
        </h1>
        <p className="text-muted-foreground">Booking dari guide untuk produk kamu.</p>
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
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                {query ? `Tidak ada hasil untuk "${query}"` : "Tidak ada data."}
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3 font-medium">{formatRupiah(b.total_price)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/vendor/bookings/${b.id}`)}
                  >
                    <Eye size={14} className="mr-1" /> Lihat Detail
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
