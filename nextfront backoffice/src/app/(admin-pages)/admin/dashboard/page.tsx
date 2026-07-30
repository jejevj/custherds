"use client"
import { useEffect, useState, Suspense } from "react"
import { Users, ShoppingBag, Map, TrendingUp, Loader2 } from "lucide-react"
import { AdminDashboardClient } from "./AdminDashboardClient"
import { UnauthorizedToast } from "@/components/unauthorized-toast"
import { PendingGuidesWidget } from "./PendingGuidesWidget"
import { PendingVendorsWidget } from "./PendingVendorsWidget"
import { adminService } from "@/services/admin.service"
import { transactionsService, Transaction } from "@/services/transactions.service"
import { Badge } from "@/components/ui/badge"

const STATUS_LABEL: Record<string, string> = {
  settled:                 "Settled",
  payment_pending:         "Menunggu Bayar",
  payment_failed:          "Gagal",
  rejected:                "Ditolak",
  pending_vendor_approval: "Menunggu Vendor",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  settled:                 "default",
  payment_pending:         "secondary",
  payment_failed:          "destructive",
  rejected:                "destructive",
  pending_vendor_approval: "secondary",
}

function fmt(n: number) {
  if (n >= 1_000_000_000)
    return "Rp " + (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000_000)
    return "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "jt"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-start gap-4 animate-pulse">
      <div className="rounded-lg bg-primary/10 p-2 w-9 h-9" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-7 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [loading,       setLoading]       = useState(true)
  const [totalUsers,    setTotalUsers]    = useState(0)
  const [activeVendors, setActiveVendors] = useState(0)
  const [activeGuides,  setActiveGuides]  = useState(0)
  const [revenue,       setRevenue]       = useState(0)
  const [recentTx,      setRecentTx]      = useState<Transaction[]>([])

  useEffect(() => {
    Promise.all([
      adminService.listUsers(),
      adminService.listVendors("approved"),
      adminService.listGuides("approved"),
      transactionsService.list("settled"),
      transactionsService.list(),
    ]).then(([users, vendors, guides, settledTx, allTx]) => {
      setTotalUsers(users.length)
      setActiveVendors(vendors.filter(v => v.is_active).length)
      setActiveGuides(guides.filter(g => g.is_active).length)
      const rev = settledTx.reduce((sum, t) => sum + (parseFloat(t.gross_amount) || 0), 0)
      setRevenue(rev)
      const sorted = [...allTx].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentTx(sorted.slice(0, 5))
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "Total Users",            value: loading ? null : totalUsers.toLocaleString("id-ID"),    icon: Users },
    { label: "Active Vendors",          value: loading ? null : activeVendors.toLocaleString("id-ID"), icon: ShoppingBag },
    { label: "Active Guides",           value: loading ? null : activeGuides.toLocaleString("id-ID"),  icon: Map },
    { label: "Total Revenue (Settled)", value: loading ? null : fmt(revenue),                          icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <UnauthorizedToast />
      </Suspense>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Custherds admin portal. Monitor and manage the entire platform here.
          </p>
        </div>
        <AdminDashboardClient />
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) =>
          stat.value === null ? (
            <StatSkeleton key={stat.label} />
          ) : (
            <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Pending approvals widgets — live from API */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PendingGuidesWidget />
        <PendingVendorsWidget />
      </div>

      {/* Recent Transactions — live */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Transaksi Terbaru</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Memuat transaksi...</span>
          </div>
        ) : recentTx.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada transaksi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">Kode</th>
                <th className="pb-2 font-medium">Gross Amount</th>
                <th className="pb-2 font-medium">Metode</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{t.transaction_code}</td>
                  <td className="py-2.5 font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(parseFloat(t.gross_amount) || 0)}
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">
                    {t.payment_method === "deposit"       ? "Deposit"
                   : t.payment_method === "pay_as_you_go" ? "QRIS"
                   : t.payment_method ?? "-"}
                  </td>
                  <td className="py-2.5">
                    <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"} className="text-xs">
                      {STATUS_LABEL[t.status] ?? t.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
