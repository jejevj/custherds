"use client"
import { useEffect, useState } from "react"
import { vendorsService, VendorProfile } from "@/services/vendors.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    vendorsService.getProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true); setError(""); setSuccess(false)
    try {
      const updated = await vendorsService.updateProfile({
        vendor_name: profile.vendor_name,
        vendor_description: profile.vendor_description,
        vendor_phone: profile.vendor_phone,
        vendor_address: profile.vendor_address,
      })
      setProfile(updated); setSuccess(true)
    } catch { setError("Gagal menyimpan profil.") }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Store Profile</h1><p className="text-muted-foreground">Kelola profil toko kamu.</p></div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Profil berhasil disimpan.</p>}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={profile?.vendor_status==="approved"?"default":"secondary"}>{profile?.vendor_status}</Badge>
        </div>
        <div className="grid gap-1"><Label>Nama Toko</Label><Input value={profile?.vendor_name??""} onChange={e=>setProfile(p=>p?{...p,vendor_name:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Deskripsi</Label><Input value={profile?.vendor_description??""} onChange={e=>setProfile(p=>p?{...p,vendor_description:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Phone</Label><Input value={profile?.vendor_phone??""} onChange={e=>setProfile(p=>p?{...p,vendor_phone:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Alamat</Label><Input value={profile?.vendor_address??""} onChange={e=>setProfile(p=>p?{...p,vendor_address:e.target.value}:p)} /></div>
        <Button onClick={handleSave} disabled={saving} className="w-full">{saving?"Menyimpan…":"Simpan"}</Button>
      </div>
    </div>
  )
}
