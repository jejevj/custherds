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
        vendor_business_name:     profile.vendor_business_name,
        vendor_short_description: profile.vendor_short_description,
        vendor_contact_person:    profile.vendor_contact_person,
        vendor_location:          profile.vendor_location,
        vendor_website:           profile.vendor_website,
        vendor_opening_hours:     profile.vendor_opening_hours,
        allow_direct_booking:     profile.allow_direct_booking,
      })
      setProfile(updated); setSuccess(true)
    } catch { setError("Gagal menyimpan profil.") }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
        <p className="text-muted-foreground">Kelola profil toko kamu.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-4">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Profil berhasil disimpan.</p>}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={profile?.vendor_status === "approved" ? "default" : "secondary"}>
            {profile?.vendor_status}
          </Badge>
        </div>

        <div className="grid gap-1">
          <Label>Nama Toko</Label>
          <Input
            value={profile?.vendor_business_name ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_business_name: e.target.value } : p)}
            placeholder="Nama toko / usaha"
          />
        </div>

        <div className="grid gap-1">
          <Label>Deskripsi Singkat</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            value={profile?.vendor_short_description ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_short_description: e.target.value } : p)}
            placeholder="Ceritakan produk & layanan bisnis kamu"
          />
        </div>

        <div className="grid gap-1">
          <Label>Contact Person</Label>
          <Input
            value={profile?.vendor_contact_person ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_contact_person: e.target.value } : p)}
            placeholder="Nama PIC yang bisa dihubungi"
          />
        </div>

        <div className="grid gap-1">
          <Label>Alamat / Lokasi</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={2}
            value={profile?.vendor_location ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_location: e.target.value } : p)}
            placeholder="Alamat lengkap toko / outlet"
          />
        </div>

        <div className="grid gap-1">
          <Label>Website</Label>
          <Input
            value={profile?.vendor_website ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_website: e.target.value } : p)}
            placeholder="https://"
          />
        </div>

        <div className="grid gap-1">
          <Label>Jam Operasional</Label>
          <Input
            value={profile?.vendor_opening_hours ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_opening_hours: e.target.value } : p)}
            placeholder="Senin-Jumat 09.00-17.00"
          />
        </div>

        {/* ── Toggle Direct Booking ─────────────────────────────── */}
        <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
          <div>
            <p className="text-sm font-medium">Izinkan Direct Booking</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jika dimatikan, guide wajib memilih package yang tersedia saat booking.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile?.allow_direct_booking ?? true}
            onClick={() => setProfile(p => p ? { ...p, allow_direct_booking: !p.allow_direct_booking } : p)}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              profile?.allow_direct_booking ? "bg-primary" : "bg-muted-foreground/30",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
                profile?.allow_direct_booking ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>
    </div>
  )
}
