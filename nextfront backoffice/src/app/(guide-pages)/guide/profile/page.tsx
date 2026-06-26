"use client"
import { useEffect, useState } from "react"
import { guidesService, GuideProfile } from "@/services/guides.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GuideProfilePage() {
  const [profile, setProfile] = useState<GuideProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    guidesService.getProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true); setError(""); setSuccess(false)
    try {
      const updated = await guidesService.updateProfile({
        guide_name: profile.guide_name,
        guide_bio: profile.guide_bio,
        guide_phone: profile.guide_phone,
        bank_name: profile.bank_name,
        bank_account_number: profile.bank_account_number,
        bank_account_name: profile.bank_account_name,
      })
      setProfile(updated); setSuccess(true)
    } catch { setError("Gagal menyimpan profil.") }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Guide Profile</h1><p className="text-muted-foreground">Kelola profil dan info bank kamu.</p></div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Profil berhasil disimpan.</p>}
        <div className="grid gap-1"><Label>Nama</Label><Input value={profile?.guide_name??""} onChange={e=>setProfile(p=>p?{...p,guide_name:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Bio</Label><Input value={profile?.guide_bio??""} onChange={e=>setProfile(p=>p?{...p,guide_bio:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Phone</Label><Input value={profile?.guide_phone??""} onChange={e=>setProfile(p=>p?{...p,guide_phone:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Bank</Label><Input value={profile?.bank_name??""} onChange={e=>setProfile(p=>p?{...p,bank_name:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>No. Rekening</Label><Input value={profile?.bank_account_number??""} onChange={e=>setProfile(p=>p?{...p,bank_account_number:e.target.value}:p)} /></div>
        <div className="grid gap-1"><Label>Atas Nama</Label><Input value={profile?.bank_account_name??""} onChange={e=>setProfile(p=>p?{...p,bank_account_name:e.target.value}:p)} /></div>
        <Button onClick={handleSave} disabled={saving} className="w-full">{saving?"Menyimpan…":"Simpan"}</Button>
      </div>
    </div>
  )
}
