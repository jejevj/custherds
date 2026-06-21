import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendor Dashboard | Custherds",
}

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Vendor</h1>
        <p className="text-muted-foreground">
          Selamat datang di portal vendor Custherds. Kelola produk, pesanan, dan bisnis Anda di sini.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Produk</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Pesanan Baru</p>
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

      {/* Placeholder recent orders */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Pesanan Terbaru</h2>
        <p className="text-sm text-muted-foreground">Belum ada pesanan masuk.</p>
      </div>
    </div>
  )
}
