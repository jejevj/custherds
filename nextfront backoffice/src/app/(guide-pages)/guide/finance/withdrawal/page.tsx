"use client"
import { useEffect, useState } from "react"
import { withdrawalsService, Withdrawal, WithdrawalCreate } from "@/services/withdrawals.service"
import { guidesService } from "@/services/guides.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STATUS_VARIANT: Record<string, "default"|"secondary"|"destructive"> = {
  completed:  "default",
  pending:    "secondary",
  processing: "secondary",
  failed:     "destructive",
}

export default function GuideWithdrawalPage() {
  const [history,  setHistory]  = useState<Withdrawal[]>([])
  const [balance,  setBalance]  = useState("0")
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [form, setForm] = useState<WithdrawalCreate>({ amount: 0 })

  useEffect(() => {
    Promise.all([
      withdrawalsService.list(),
      guidesService.getWallet(),
    ]).then(([h, w]) => {
      setHistory(h)
      setBalance(w.wallet_balance)
    }).catch(() => setError("Gagal memuat data."))
    .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("")
    try {
      const w = await withdrawalsService.create(form)
      setHistory(prev => [w, ...prev])
      setBalance(prev => String(Number(prev) - form.amount))
      setForm({ amount: 0 })
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || "Gagal membuat withdrawal.")
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdrawal</h1>
        <p className="text-muted-foreground">Tarik saldo komisi ke rekening bank kamu.</p>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm max-w-sm">
        <p className="text-sm text-muted-foreground mb-1">Saldo Tersedia</p>
        <p className="text-3xl font-bold mb-4">Rp {Number(balance).toLocaleString("id-ID")}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid gap-1"><Label>Jumlah (Rp)</Label><Input required type="number" min={1} value={form.amount || ""} onChange={e=>setForm(p=>({...p,amount:parseInt(e.target.value)}))} /></div>
          <div className="grid gap-1"><Label>Bank</Label><Input value={form.bank_name??""} onChange={e=>setForm(p=>({...p,bank_name:e.target.value}))} placeholder="BCA, BNI, dll" /></div>
          <div className="grid gap-1"><Label>No. Rekening</Label><Input value={form.bank_account_number??""} onChange={e=>setForm(p=>({...p,bank_account_number:e.target.value}))} /></div>
          <div className="grid gap-1"><Label>Atas Nama</Label><Input value={form.bank_account_name??""} onChange={e=>setForm(p=>({...p,bank_account_name:e.target.value}))} /></div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Memproses…" : "Request Withdrawal"}</Button>
        </form>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b bg-muted/40">
            <th className="px-4 py-3 font-medium">Jumlah</th>
            <th className="px-4 py-3 font-medium">Bank</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Memuat...</td></tr>
            : history.map(w => (
              <tr key={w.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">Rp {Number(w.amount).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">{w.bank_name} - {w.bank_account_number}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[w.status] ?? "secondary"}>{w.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(w.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
