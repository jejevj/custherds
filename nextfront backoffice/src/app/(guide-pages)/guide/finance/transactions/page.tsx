"use client"
import { useEffect, useState } from "react"
import { transactionsService, Transaction } from "@/services/transactions.service"
import { Badge } from "@/components/ui/badge"

export default function GuideTransactionsPage() {
  const [data,    setData]    = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    transactionsService.list().then(setData).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">Riwayat transaksi kamu.</p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b bg-muted/40">
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Guide Share</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            : data.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id.slice(0,8)}…</td>
                <td className="px-4 py-3">Rp {Number(t.amount).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 font-medium">Rp {Number(t.guide_share).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3"><Badge variant={t.status==="completed"?"default":"secondary"}>{t.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
