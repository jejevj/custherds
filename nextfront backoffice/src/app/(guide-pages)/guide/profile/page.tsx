"use client"
import { useEffect, useState } from "react"
import { guidesService, GuideProfile, GuideBankPayload } from "@/services/guides.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GuideProfilePage() {
  const [profile, setProfile] = useState<GuideProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [savingBank, setSavingBank] = useState(false)
  const [error,   setError]     = useState("")
  const [errorBank, setErrorBank] = useState("")
  const [success, setSuccess]   = useState(false)
  const [successBank, setSuccessBank] = useState(false)

  useEffect(() => {
    guidesService.getProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  // Simpan profil umum (bio, phone, nationality, languages) — PUT /guides/me
  // Hanya bisa saat status incomplete atau rejected
  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true); setError(""); setSuccess(false)
    try {
      const updated = await guidesService.updateProfile({
        bio: profile.bio,
        guide_phone: profile.guide_phone,
        guide_nationality: profile.guide_nationality,
        languages: profile.languages,
      })
      setProfile(updated); setSuccess(true)
    } catch { setError("Gagal menyimpan profil. Pastikan status akun kamu incomplete atau rejected.") }
    finally { setSaving(false) }
  }

  // Simpan info bank — PUT /guides/me/bank
  // Bisa diakses di semua status (termasuk approved)
  const handleSaveBank = async () => {
    if (!profile) return
    setSavingBank(true); setErrorBank(""); setSuccessBank(false)
    try {
      const payload: GuideBankPayload = {
        bank_code:           profile.bank_code,
        bank_name:           profile.bank_name,
        bank_branch:         profile.bank_branch,
        bank_account_number: profile.bank_account_number,
        bank_account_name:   profile.bank_account_name,
      }
      const updated = await guidesService.updateBank(payload)
      setProfile(updated); setSuccessBank(true)
    } catch { setErrorBank("Gagal menyimpan informasi rekening bank.") }
    finally { setSavingBank(false) }
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Profile</h1>
        <p className="text-muted-foreground">Kelola profil dan info bank kamu.</p>
      </div>

      {/* ── Informasi Umum ── */}
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        <p className="text-sm font-semibold">Informasi Umum</p>
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

        <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
          {saving ? "Menyimpan…" : "Simpan Profil"}
        </Button>
      </div>

      {/* ── Informasi Rekening Bank ── */}
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        <p className="text-sm font-semibold">Informasi Rekening Bank</p>
        <p className="text-xs text-muted-foreground">Data rekening bank dapat diubah kapan saja, termasuk saat akun sudah approved.</p>
        {errorBank   && <p className="text-sm text-red-500">{errorBank}</p>}
        {successBank && <p className="text-sm text-green-600">Informasi rekening berhasil disimpan.</p>}

        <div className="grid gap-1">
          <Label>Kode Bank</Label>
          <Input
            value={profile?.bank_code ?? ""}
            onChange={e => setProfile(p => p ? { ...p, bank_code: e.target.value } : p)}
            placeholder="014 (BCA), 008 (Mandiri), dll."
          />
        </div>
        <div className="grid gap-1">
          <Label>Nama Bank</Label>
          <Input
            value={profile?.bank_name ?? ""}
            onChange={e => setProfile(p => p ? { ...p, bank_name: e.target.value } : p)}
            placeholder="BCA / Mandiri / BRI / dst."
          />
        </div>
        <div className="grid gap-1">
          <Label>Cabang Bank</Label>
          <Input
            value={profile?.bank_branch ?? ""}
            onChange={e => setProfile(p => p ? { ...p, bank_branch: e.target.value } : p)}
            placeholder="Cabang Palembang, dll."
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

        {/* Settlement ID — read-only, hanya admin yang bisa mengubah */}
        <div className="grid gap-1">
          <Label className="flex items-center gap-1">
            Settlement ID
            <span className="text-xs text-muted-foreground font-normal">(diisi oleh admin)</span>
          </Label>
          <Input
            value={profile?.bank_settlement_id ?? ""}
            readOnly
            disabled
            className="bg-muted cursor-not-allowed opacity-70"
            placeholder="Belum diset oleh admin"
          />
        </div>

        <Button onClick={handleSaveBank} disabled={savingBank} className="w-full">
          {savingBank ? "Menyimpan…" : "Simpan Rekening"}
        </Button>
      </div>
    </div>
  )
}
