"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Receipt } from "lucide-react"
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

export default function GuideBookingsPage() {
  const router  = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  const { query, setQuery, filtered } = useTableSearch(bookings)

  useEffect(() => {
    bookingsService.list()
      .then(setBookings)
      .catch(() => setError("Gagal memuat bookings."))
      .finally(() => setLoading(false))
  }, [])

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
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{STATUS_LABEL[b.status] ?? b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/guide/bookings/${b.id}`)}>
                    <Eye size={13} className="mr-1" /> Lihat Detail
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {b.status === "pending_receipt" && (
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => router.push(`/guide/bookings/${b.id}`)}>
                        <Receipt size={13} className="mr-1" /> Submit Transaksi
                      </Button>
                    )}
                    {canCancel(b) && (
                      <Button size="sm" variant="outline" className="text-red-500 border-red-300 hover:bg-red-50"
                        onClick={() => router.push(`/guide/bookings/${b.id}`)}>
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
    </div>
  )
}
