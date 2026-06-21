import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide Dashboard | Custherds",
}

export default function GuideDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Pemandu</h1>
        <p className="text-muted-foreground">
          Selamat datang di portal pemandu Custherds. Kelola jadwal, paket tur, dan wisatawan Anda di sini.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Jadwal Hari Ini</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Permintaan Masuk</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Pendapatan Bulan Ini</p>
          <p className="text-3xl font-bold mt-1">Rp 0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
          <p className="text-3xl font-bold mt-1">—</p>
        </div>
      </div>

      {/* Placeholder upcoming schedules */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Jadwal Mendatang</h2>
        <p className="text-sm text-muted-foreground">Belum ada jadwal tur terdaftar.</p>
      </div>
    </div>
  )
}
