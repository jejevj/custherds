"use client"
import { useEffect, useState } from "react"
import { adminService, SplitConfig } from "@/services/admin.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function AdminCommissionPage() {
  const [configs,  setConfigs]  = useState<SplitConfig[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [vendor,   setVendor]   = useState("")
  const [guide,    setGuide]    = useState("")
  const [platform, setPlatform] = useState("")
  const [notes,    setNotes]    = useState("")

  useEffect(() => {
    adminService.listSplitConfigs()
      .then(setConfigs)
      .catch(() => setError("Gagal memuat konfigurasi."))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const v = parseFloat(vendor), g = parseFloat(guide), p = parseFloat(platform)
    if (Math.abs(v + g + p - 100) > 0.01) { setError("Total harus 100%"); return }
    setSaving(true)
    try {
      const created = await adminService.createSplitConfig({ vendor_percent: v, guide_percent: g, platform_percent: p, notes })
      setConfigs(prev => [created, ...prev.map(c => ({ ...c, is_active: false }))])
      setVendor(""); setGuide(""); setPlatform(""); setNotes(""); setError("")
    } catch { setError("Gagal menyimpan konfigurasi.") }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commission Split</h1>
        <p className="text-muted-foreground">Atur pembagian revenue antara vendor, guide, dan platform.</p>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 max-w-md">
        <h2 className="font-semibold">Set Konfigurasi Baru</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1"><Label>Vendor %</Label><Input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="40" /></div>
          <div className="grid gap-1"><Label>Guide %</Label><Input value={guide} onChange={e=>setGuide(e.target.value)} placeholder="40" /></div>
          <div className="grid gap-1"><Label>Platform %</Label><Input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="20" /></div>
        </div>
        <div className="grid gap-1"><Label>Notes</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opsional" /></div>
        <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Menyimpan…" : "Simpan"}</Button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Guide</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Berlaku Sejak</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</td></tr>
            ) : configs.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{c.vendor_percent}%</td>
                <td className="px-4 py-3">{c.guide_percent}%</td>
                <td className="px-4 py-3">{c.platform_percent}%</td>
                <td className="px-4 py-3"><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.effective_from).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
