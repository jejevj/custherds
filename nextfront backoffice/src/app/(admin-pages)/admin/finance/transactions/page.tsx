"use client"
import { useEffect, useState } from "react"
import { adminService, AdminTransaction } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  settled:          "default",
  payment_pending:  "secondary",
  payment_failed:   "destructive",
  rejected:         "destructive",
  pending_vendor_approval: "secondary",
}

const STATUS_LABEL: Record<string, string> = {
  settled:                 "Settled",
  payment_pending:         "Menunggu Bayar",
  payment_failed:          "Gagal",
  rejected:                "Ditolak",
  pending_vendor_approval: "Menunggu Vendor",
}

function fmt(n?: string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
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
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Gross Total</th>
              <th className="px-4 py-3 font-medium">Vendor Share</th>
              <th className="px-4 py-3 font-medium">Komisi Guide</th>
              <th className="px-4 py-3 font-medium">Fee Platform</th>
              <th className="px-4 py-3 font-medium">Metode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Tidak ada data.</td></tr>
            ) : data.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  <span className="block">{t.transaction_code}</span>
                  <span className="text-[10px] text-muted-foreground/60">{t.id.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3 font-medium">{fmt(t.gross_amount)}</td>
                <td className="px-4 py-3 text-blue-400">{fmt(t.vendor_amount)}</td>
                <td className="px-4 py-3">{fmt(t.guide_commission)}</td>
                <td className="px-4 py-3">{fmt(t.platform_fee)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {t.payment_method ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
