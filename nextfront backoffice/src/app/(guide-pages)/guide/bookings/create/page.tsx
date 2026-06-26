"use client"
import { useState } from "react"
import { bookingsService, BookingCreate } from "@/services/bookings.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function CreateBookingPage() {
  const router = useRouter()
  const [form, setForm] = useState<BookingCreate>({
    vendor_id: "", booking_date: "", pax_count: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const set = (k: keyof BookingCreate, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      await bookingsService.create(form)
      router.push("/guide/bookings")
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || "Gagal membuat booking.")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Booking</h1>
        <p className="text-muted-foreground">Isi detail booking untuk tourist kamu.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid gap-1"><Label>Vendor ID</Label><Input required value={form.vendor_id} onChange={e=>set("vendor_id",e.target.value)} placeholder="UUID vendor" /></div>
        <div className="grid gap-1"><Label>Tanggal Booking</Label><Input required type="date" value={form.booking_date} onChange={e=>set("booking_date",e.target.value)} /></div>
        <div className="grid gap-1"><Label>Jumlah Pax</Label><Input required type="number" min={1} value={form.pax_count} onChange={e=>set("pax_count",parseInt(e.target.value))} /></div>
        <div className="grid gap-1"><Label>Kewarganegaraan Turis</Label><Input value={form.tourist_nationality??""} onChange={e=>set("tourist_nationality",e.target.value)} placeholder="WNA / WNI" /></div>
        <div className="grid gap-1"><Label>Catatan</Label><Input value={form.notes??""} onChange={e=>set("notes",e.target.value)} placeholder="Opsional" /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Menyimpan…" : "Buat Booking"}</Button>
      </form>
    </div>
  )
}
