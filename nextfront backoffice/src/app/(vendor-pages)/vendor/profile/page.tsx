"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { vendorsService, VendorProfile, resolveCoverPhoto } from "@/services/vendors.service"
import { uploadPhotos } from "@/services/uploads.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, X, Loader2 } from "lucide-react"

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
        gallery_urls:             profile.gallery_urls,
      })
      setProfile(updated)
      setSuccess(true)
    } catch { setError("Gagal menyimpan profil.") }
    finally { setSaving(false) }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      // uploadPhotos = batch upload ke /uploads/batch, return string[] URL
      const urls = await uploadPhotos(files)
      setProfile(p => p ? { ...p, gallery_urls: [...(p.gallery_urls ?? []), ...urls] } : p)
    } catch { setError("Gagal upload foto.") }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const removeGalleryPhoto = (idx: number) => {
    setProfile(p => p ? { ...p, gallery_urls: p.gallery_urls.filter((_, i) => i !== idx) } : p)
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
        <p className="text-muted-foreground">Kelola profil toko kamu.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-lg space-y-5">
        {error   && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-500">Profil berhasil disimpan.</p>}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={profile?.vendor_status === "approved" ? "default" : "secondary"}>
            {profile?.vendor_status}
          </Badge>
        </div>

        <div className="grid gap-1.5">
          <Label>Nama Toko</Label>
          <Input
            value={profile?.vendor_business_name ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_business_name: e.target.value } : p)}
            placeholder="Nama toko / usaha"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Deskripsi Singkat</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            rows={3}
            value={profile?.vendor_short_description ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_short_description: e.target.value } : p)}
            placeholder="Ceritakan produk & layanan bisnis kamu"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Contact Person</Label>
          <Input
            value={profile?.vendor_contact_person ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_contact_person: e.target.value } : p)}
            placeholder="Nama PIC yang bisa dihubungi"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Alamat / Lokasi</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            rows={2}
            value={profile?.vendor_location ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_location: e.target.value } : p)}
            placeholder="Alamat lengkap toko / outlet"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Website</Label>
          <Input
            value={profile?.vendor_website ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_website: e.target.value } : p)}
            placeholder="https://"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Jam Operasional</Label>
          <Input
            value={profile?.vendor_opening_hours ?? ""}
            onChange={e => setProfile(p => p ? { ...p, vendor_opening_hours: e.target.value } : p)}
            placeholder="Senin-Jumat 09.00-17.00"
          />
        </div>

        {/* ── Galeri Foto Tempat ─────────────────────────────────────────── */}
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between">
            <Label>Galeri Foto Tempat</Label>
            <span className="text-xs text-muted-foreground">{profile?.gallery_urls?.length ?? 0} foto</span>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            Foto tempat, suasana, atau fasilitas yang akan dilihat guide sebelum booking.
          </p>

          {(profile?.gallery_urls?.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {profile!.gallery_urls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                  <Image
                    src={resolveCoverPhoto(url)}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => removeGalleryPhoto(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryUpload}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-white/20 text-xs text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors disabled:opacity-50"
          >
            {uploading
              ? <><Loader2 size={14} className="animate-spin" /> Mengupload...</>
              : <><ImagePlus size={14} /> Tambah Foto</>
            }
          </button>
        </div>

        {/* ── Toggle Direct Booking ─────────────────────────────────────── */}
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
              "transition-colors focus-visible:outline-none",
              profile?.allow_direct_booking ? "bg-primary" : "bg-muted-foreground/30",
            ].join(" ")}
          >
            <span className={[
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
              profile?.allow_direct_booking ? "translate-x-5" : "translate-x-0",
            ].join(" ")} />
          </button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>
    </div>
  )
}
