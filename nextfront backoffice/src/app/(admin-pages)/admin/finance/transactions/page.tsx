"use client"
import { useEffect, useState } from "react"
import { adminService, AdminTransaction } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<string, "default"|"secondary"|"destructive"> = {
  completed: "default",
  pending:   "secondary",
  failed:    "destructive",
}

export default function AdminTransactionsPage() {
  const [data,    setData]    = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    adminService.listTransactions()
      .then(setData)
      .catch(() => setError("Gagal memuat transaksi."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Seluruh transaksi di platform.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Vendor Share</th>
              <th className="px-4 py-3 font-medium">Guide Share</th>
              <th className="px-4 py-3 font-medium">Platform Fee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Tidak ada data.</td></tr>
            ) : data.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id.slice(0,8)}…</td>
                <td className="px-4 py-3 font-medium">Rp {Number(t.amount).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">Rp {Number(t.vendor_share).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">Rp {Number(t.guide_share).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">Rp {Number(t.platform_fee).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"}>{t.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
