"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { vendorsService, VendorProfile, resolveCoverPhoto } from "@/services/vendors.service"
import { uploadPhotos } from "@/services/uploads.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, X, Loader2, Store, Images, Settings2 } from "lucide-react"

// Shared glass class
const glass = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"

export default function VendorProfilePage() {
  const [profile,   setProfile]   = useState<VendorProfile | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [success,   setSuccess]   = useState(false)
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
      const urls = await uploadPhotos(files)
      setProfile(p => p ? { ...p, gallery_urls: [...(p.gallery_urls ?? []), ...urls] } : p)
    } catch { setError("Gagal upload foto.") }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = "" }
  }

  const removeGalleryPhoto = (idx: number) =>
    setProfile(p => p ? { ...p, gallery_urls: p.gallery_urls.filter((_, i) => i !== idx) } : p)

  if (loading) return (
    <div className="grid grid-cols-12 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="col-span-12 md:col-span-6 h-10 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Kelola informasi dan galeri toko kamu.</p>
        </div>
        <Badge
          variant={profile?.vendor_status === "approved" ? "default" : "secondary"}
          className="capitalize mt-1"
        >
          {profile?.vendor_status}
        </Badge>
      </div>

      {error   && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">{error}</p>}
      {success && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">✓ Profil berhasil disimpan.</p>}

      {/* Grid 12 */}
      <div className="grid grid-cols-12 gap-6">

        {/* KIRI col-8 */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Card Info Dasar */}
          <section className={`${glass} p-6 space-y-5`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Store size={13} /> Info Dasar
            </div>

            {/* Nama Toko */}
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Nama Toko</Label>
              <Input
                value={profile?.vendor_business_name ?? ""}
                onChange={e => setProfile(p => p ? { ...p, vendor_business_name: e.target.value } : p)}
                placeholder="Nama toko / usaha"
                className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
              />
            </div>

            {/* Deskripsi */}
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Deskripsi Singkat</Label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={profile?.vendor_short_description ?? ""}
                onChange={e => setProfile(p => p ? { ...p, vendor_short_description: e.target.value } : p)}
                placeholder="Ceritakan produk & layanan bisnis kamu"
              />
            </div>

            {/* Contact + Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Contact Person</Label>
                <Input
                  value={profile?.vendor_contact_person ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_contact_person: e.target.value } : p)}
                  placeholder="Nama PIC"
                  className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Website</Label>
                <Input
                  value={profile?.vendor_website ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_website: e.target.value } : p)}
                  placeholder="https://"
                  className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>

            {/* Jam + Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Jam Operasional</Label>
                <Input
                  value={profile?.vendor_opening_hours ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_opening_hours: e.target.value } : p)}
                  placeholder="Senin–Jumat 09.00–17.00"
                  className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Alamat / Lokasi</Label>
                <Input
                  value={profile?.vendor_location ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_location: e.target.value } : p)}
                  placeholder="Alamat lengkap toko / outlet"
                  className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>
          </section>

          {/* Card Pengaturan Booking */}
          <section className={`${glass} p-6 space-y-4`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Settings2 size={13} /> Pengaturan Booking
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Izinkan Direct Booking</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jika dimatikan, guide wajib memilih package saat booking.
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
                  profile?.allow_direct_booking ? "bg-primary" : "bg-white/20",
                ].join(" ")}
              >
                <span className={[
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
                  profile?.allow_direct_booking ? "translate-x-5" : "translate-x-0",
                ].join(" ")} />
              </button>
            </div>
          </section>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-10">
            {saving
              ? <><Loader2 size={14} className="animate-spin mr-2" />Menyimpan…</>
              : "Simpan Perubahan"
            }
          </Button>
        </div>

        {/* KANAN col-4 sticky */}
        <div className="col-span-12 lg:col-span-4">
          <section className={`${glass} p-6 space-y-4 sticky top-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                <Images size={13} /> Galeri Foto
              </div>
              <span className="text-xs text-muted-foreground">
                {profile?.gallery_urls?.length ?? 0} foto
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Foto suasana &amp; fasilitas. Ditampilkan ke guide saat browse vendor.
            </p>

            {/* Preview grid */}
            {(profile?.gallery_urls?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {profile!.gallery_urls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <Image
                      src={resolveCoverPhoto(url)}
                      alt={`Foto ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      onClick={() => removeGalleryPhoto(i)}
                      className="absolute top-1 right-1 bg-white/10 backdrop-blur-sm hover:bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
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
              className="flex flex-col items-center justify-center gap-2 w-full py-7 rounded-xl border-2 border-dashed border-white/15 text-xs text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all disabled:opacity-40"
            >
              {uploading
                ? <><Loader2 size={18} className="animate-spin" /><span>Mengupload...</span></>
                : <><ImagePlus size={18} /><span className="font-medium">Tambah Foto</span><span className="opacity-50">JPG · PNG · WEBP</span></>
              }
            </button>

            <p className="text-[11px] text-center text-muted-foreground/50">
              Klik <span className="text-muted-foreground">Simpan Perubahan</span> setelah upload.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
