"use client"
import { useEffect, useState } from "react"
import { bookingsService, Booking } from "@/services/bookings.service"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const STATUS_VARIANT: Record<string, "default"|"secondary"|"destructive"> = {
  confirmed:      "default",
  pending_vendor: "secondary",
  rejected:       "destructive",
}

export default function GuideBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

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
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada booking.</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-4 py-3">{new Date(b.booking_date).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">{b.pax_count}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
