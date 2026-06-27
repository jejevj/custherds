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
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-span-12 md:col-span-6 h-12 rounded-xl bg-white/5 animate-pulse" />
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={profile?.vendor_status === "approved" ? "default" : "secondary"} className="capitalize">
            {profile?.vendor_status}
          </Badge>
        </div>
      </div>

      {error   && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      {success && <p className="text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">Profil berhasil disimpan.</p>}

      {/* Grid 12 kolom */}
      <div className="grid grid-cols-12 gap-6">

        {/* KIRI — col 1-8 */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          <section className="rounded-2xl border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Store size={15} /> Info Dasar
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

            {/* Contact + Website — 2 kolom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Contact Person</Label>
                <Input
                  value={profile?.vendor_contact_person ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_contact_person: e.target.value } : p)}
                  placeholder="Nama PIC"
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
            </div>

            {/* Jam + Lokasi — 2 kolom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Jam Operasional</Label>
                <Input
                  value={profile?.vendor_opening_hours ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_opening_hours: e.target.value } : p)}
                  placeholder="Senin–Jumat 09.00–17.00"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Alamat / Lokasi</Label>
                <Input
                  value={profile?.vendor_location ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_location: e.target.value } : p)}
                  placeholder="Alamat lengkap toko / outlet"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Settings2 size={15} /> Pengaturan Booking
            </div>
            <div className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/30">
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
                  profile?.allow_direct_booking ? "bg-primary" : "bg-muted-foreground/30",
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

        {/* KANAN — col 9-12, sticky */}
        <div className="col-span-12 lg:col-span-4">
          <section className="rounded-2xl border bg-card p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Images size={15} /> Galeri Foto Tempat
              </div>
              <span className="text-xs text-muted-foreground">
                {profile?.gallery_urls?.length ?? 0} foto
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Foto suasana &amp; fasilitas tempat. Ditampilkan ke guide saat browse vendor.
            </p>

            {(profile?.gallery_urls?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
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
                      <X size={11} />
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
              className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-white/20 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              {uploading
                ? <><Loader2 size={20} className="animate-spin" /><span>Mengupload...</span></>
                : <><ImagePlus size={20} /><span>Klik atau drag foto ke sini</span><span className="text-[10px] opacity-60">JPG, PNG, WEBP • maks 10 MB</span></>
              }
            </button>

            <p className="text-[11px] text-muted-foreground/60 text-center">
              Klik <strong>Simpan Perubahan</strong> setelah upload agar tersimpan.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
