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
        bio: profile.bio,
        guide_phone: profile.guide_phone,
        guide_nationality: profile.guide_nationality,
        languages: profile.languages,
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Profile</h1>
        <p className="text-muted-foreground">Kelola profil dan info bank kamu.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Profil berhasil disimpan.</p>}

        <div className="grid gap-1">
          <Label>Bio / Deskripsi Diri</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            value={profile?.bio ?? ""}
            onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)}
            placeholder="Ceritakan pengalaman & keahlian kamu sebagai guide"
          />
        </div>

        <div className="grid gap-1">
          <Label>Kewarganegaraan</Label>
          <Input
            value={profile?.guide_nationality ?? ""}
            onChange={e => setProfile(p => p ? { ...p, guide_nationality: e.target.value } : p)}
            placeholder="WNI / WNA"
          />
        </div>

        <div className="grid gap-1">
          <Label>Nomor HP</Label>
          <Input
            value={profile?.guide_phone ?? ""}
            onChange={e => setProfile(p => p ? { ...p, guide_phone: e.target.value } : p)}
            placeholder="+62..."
          />
        </div>

        <div className="grid gap-1">
          <Label>Bahasa yang Dikuasai</Label>
          <Input
            value={profile?.languages ?? ""}
            onChange={e => setProfile(p => p ? { ...p, languages: e.target.value } : p)}
            placeholder="Indonesia, English, dll."
          />
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">Informasi Rekening Bank</p>
          <div className="space-y-3">
            <div className="grid gap-1">
              <Label>Nama Bank</Label>
              <Input
                value={profile?.bank_name ?? ""}
                onChange={e => setProfile(p => p ? { ...p, bank_name: e.target.value } : p)}
                placeholder="BCA / Mandiri / BRI / dst."
              />
            </div>
            <div className="grid gap-1">
              <Label>Nomor Rekening</Label>
              <Input
                value={profile?.bank_account_number ?? ""}
                onChange={e => setProfile(p => p ? { ...p, bank_account_number: e.target.value } : p)}
                placeholder="Nomor rekening aktif"
              />
            </div>
            <div className="grid gap-1">
              <Label>Atas Nama</Label>
              <Input
                value={profile?.bank_account_name ?? ""}
                onChange={e => setProfile(p => p ? { ...p, bank_account_name: e.target.value } : p)}
                placeholder="Nama sesuai buku tabungan"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>
    </div>
  )
}
