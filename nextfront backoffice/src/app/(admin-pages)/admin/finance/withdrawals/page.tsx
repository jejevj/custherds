"use client"
import { useEffect, useState } from "react"
import { adminService, AdminWithdrawal } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_VARIANT: Record<string, "default"|"secondary"|"destructive"> = {
  completed:  "default",
  pending:    "secondary",
  processing: "secondary",
  failed:     "destructive",
}

export default function AdminWithdrawalsPage() {
  const [data,    setData]    = useState<AdminWithdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    adminService.listWithdrawals()
      .then(setData)
      .catch(() => setError("Gagal memuat withdrawals."))
      .finally(() => setLoading(false))
  }, [])

  const disburse = async (id: string) => {
    await adminService.disburseWithdrawal(id)
    setData(prev => prev.map(w => w.id === id ? { ...w, status: "processing" } : w))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">Kelola permintaan penarikan dana guide.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 font-medium">No. Rekening</th>
              <th className="px-4 py-3 font-medium">Atas Nama</th>
              <th className="px-4 py-3 font-medium">Jumlah</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Tidak ada data.</td></tr>
            ) : data.map(w => (
              <tr key={w.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{w.bank_name}</td>
                <td className="px-4 py-3 font-mono text-xs">{w.bank_account_number}</td>
                <td className="px-4 py-3">{w.bank_account_name}</td>
                <td className="px-4 py-3 font-medium">Rp {Number(w.amount).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[w.status] ?? "secondary"}>{w.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {w.status === "pending" && (
                    <Button size="sm" onClick={() => disburse(w.id)}>Disburse</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
