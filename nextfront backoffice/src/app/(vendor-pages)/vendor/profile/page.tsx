"use client"
import { useEffect, useRef, useState, useMemo } from "react"
import Image from "next/image"
import { vendorsService, VendorProfile, resolveCoverPhoto } from "@/services/vendors.service"
import { vendorCategoriesService, VendorCategory } from "@/services/vendorCategories.service"
import {
  vendorAreasService,
  VendorAreaKabupaten,
  VendorAreaKecamatan,
  VendorAreaKelurahan,
} from "@/services/vendorAreas.service"
import { uploadPhotos } from "@/services/uploads.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ImagePlus, X, Loader2, Store, Images, Settings2,
  Tag, ChevronDown, Check, MapPin,
} from "lucide-react"

const glass    = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"

// ─── Generic Select Dropdown ───────────────────────────────────────────────
function SimpleSelect<T extends { id: number; name: string }>({
  items,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  items: T[]
  value: number | null
  onChange: (id: number | null) => void
  placeholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = items.find((i) => i.id === value)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={[
          "w-full flex items-center justify-between gap-2",
          "border border-white/10 rounded-xl px-3 py-2 text-sm",
          "bg-white/5 backdrop-blur-sm transition-colors",
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40",
          !selected ? "text-muted-foreground/50" : "",
        ].join(" ")}
      >
        <span className="truncate">{selected ? selected.name : placeholder}</span>
        <ChevronDown className={[
          "h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
          open ? "rotate-180" : "",
        ].join(" ")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[200] mt-1.5 w-full min-w-[200px] rounded-xl border border-white/10 bg-popover shadow-xl text-sm overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-white/5 text-muted-foreground/60 text-xs italic"
              >
                — Tidak dipilih
              </button>
            </li>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { onChange(item.id); setOpen(false) }}
                className={[
                  "w-full flex items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/5",
                  item.id === value ? "text-primary" : "",
                ].join(" ")}
              >
                <Check className={[
                  "h-3.5 w-3.5 shrink-0",
                  item.id === value ? "opacity-100" : "opacity-0",
                ].join(" ")} />
                {item.name}
              </button>
            ))}
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground/50">Tidak ada data.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── CategorySelect ────────────────────────────────────────────────────────
function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: VendorCategory[]
  value: number | null
  onChange: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const grouped = useMemo((): Map<string, VendorCategory[]> => {
    const map: Map<string, VendorCategory[]> = new Map<string, VendorCategory[]>()
    categories.forEach((c) => {
      if (!map.has(c.group_name)) map.set(c.group_name, [])
      map.get(c.group_name)!.push(c)
    })
    return map
  }, [categories])

  const selected = categories.find((c) => c.id === value)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={[
          "w-full flex items-center justify-between gap-2",
          "border border-white/10 rounded-xl px-3 py-2 text-sm",
          "bg-white/5 backdrop-blur-sm transition-colors",
          "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40",
          !selected ? "text-muted-foreground/50" : "",
        ].join(" ")}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <Tag className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span>{selected.name}</span>
              <span className="text-muted-foreground/50 text-xs">· {selected.group_name}</span>
            </>
          ) : (
            <span>Pilih kategori toko…</span>
          )}
        </span>
        <ChevronDown className={[
          "h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
          open ? "rotate-180" : "",
        ].join(" ")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[200] mt-1.5 w-full rounded-xl border border-white/10 bg-popover shadow-xl text-sm overflow-hidden">
          <ul className="max-h-64 overflow-y-auto py-1">
            {Array.from(grouped.entries()).map(([groupName, items]) => (
              <li key={groupName}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {groupName}
                </div>
                {items.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { onChange(cat.id); setOpen(false) }}
                    className={[
                      "w-full flex items-center gap-2 px-4 py-2 text-left transition-colors",
                      "hover:bg-white/5",
                      cat.id === value ? "text-primary" : "",
                    ].join(" ")}
                  >
                    <Check className={[
                      "h-3.5 w-3.5 shrink-0",
                      cat.id === value ? "opacity-100" : "opacity-0",
                    ].join(" ")} />
                    {cat.name}
                  </button>
                ))}
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground/50">
                Tidak ada kategori tersedia.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function VendorProfilePage() {
  const [profile,     setProfile]     = useState<VendorProfile | null>(null)
  const [categories,  setCategories]  = useState<VendorCategory[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [kabupatens,  setKabupatens]  = useState<VendorAreaKabupaten[]>([])
  const [kecamatans,  setKecamatans]  = useState<VendorAreaKecamatan[]>([])
  const [kelurahans,  setKelurahans]  = useState<VendorAreaKelurahan[]>([])

  const [selKab, setSelKab] = useState<number | null>(null)
  const [selKec, setSelKec] = useState<number | null>(null)
  const [selKel, setSelKel] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      vendorsService.getProfile(),
      vendorCategoriesService.list({ is_active: true }),
      vendorAreasService.listKabupaten(),
      vendorAreasService.listKecamatan(),
      vendorAreasService.listKelurahan(),
    ])
      .then(([p, cats, kabs, kecs, kels]) => {
        setProfile(p)
        setCategories([...cats].sort((a, b) =>
          a.group_name.localeCompare(b.group_name) || a.sort_order - b.sort_order,
        ))
        setKabupatens(kabs.filter((k) => k.is_active))
        setKecamatans(kecs.filter((k) => k.is_active))
        setKelurahans(kels.filter((k) => k.is_active))
        setSelKab(p.vendor_area_kabupaten ?? null)
        setSelKec(p.vendor_area_kecamatan ?? null)
        setSelKel(p.vendor_area_kelurahan ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredKec = useMemo((): VendorAreaKecamatan[] => {
    if (!selKab) return []
    return kecamatans.filter((k) => k.kabupaten_id === selKab)
  }, [kecamatans, selKab])

  const filteredKel = useMemo((): VendorAreaKelurahan[] => {
    if (!selKec) return []
    return kelurahans.filter((k) => k.kecamatan_id === selKec)
  }, [kelurahans, selKec])

  const handleKabChange = (id: number | null) => { setSelKab(id); setSelKec(null); setSelKel(null) }
  const handleKecChange = (id: number | null) => { setSelKec(id); setSelKel(null) }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true); setError(""); setSuccess(false)
    try {
      const updated = await vendorsService.updateProfile({
        vendor_business_name:     profile.vendor_business_name,
        vendor_category:          profile.vendor_category,
        vendor_area:              selKel ?? selKec ?? selKab ?? null,
        vendor_area_kabupaten:    selKab,
        vendor_area_kecamatan:    selKec,
        vendor_area_kelurahan:    selKel,
        vendor_short_description: profile.vendor_short_description,
        vendor_contact_person:    profile.vendor_contact_person,
        vendor_location:          profile.vendor_location,
        vendor_website:           profile.vendor_website,
        vendor_opening_hours:     profile.vendor_opening_hours,
        allow_direct_booking:     profile.allow_direct_booking,
        gallery_urls:             profile.gallery_urls,
      })
      setProfile(updated)
      setSelKab(updated.vendor_area_kabupaten ?? null)
      setSelKec(updated.vendor_area_kecamatan ?? null)
      setSelKel(updated.vendor_area_kelurahan ?? null)
      setSuccess(true)
    } catch (err) {
      console.error("[VendorProfile] gagal menyimpan:", err)
      setError("Gagal menyimpan profil. Silahkan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await uploadPhotos(files)
      setProfile(p => p ? { ...p, gallery_urls: [...(p.gallery_urls ?? []), ...urls] } : p)
    } catch (err) {
      console.error("[VendorProfile] gagal upload foto:", err)
      setError("Gagal upload foto.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
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

      <div className="grid grid-cols-12 gap-6">

        {/* ── KIRI col-8 ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Card Info Dasar */}
          <section className={`${glass} p-6 space-y-5`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Store size={13} /> Info Dasar
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Nama Toko</Label>
              <Input
                value={profile?.vendor_business_name ?? ""}
                onChange={e => setProfile(p => p ? { ...p, vendor_business_name: e.target.value } : p)}
                placeholder="Nama toko / usaha"
                className="bg-white/5 border-white/10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 rounded-xl"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Tag size={11} /> Kategori Toko
              </Label>
              <CategorySelect
                categories={categories}
                value={profile?.vendor_category ?? null}
                onChange={(id) => setProfile(p => p ? { ...p, vendor_category: id } : p)}
              />
              <p className="text-[11px] text-muted-foreground/50">
                Kategori menentukan bagaimana toko kamu ditampilkan ke guide.
              </p>
            </div>

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

          {/* Card Area Layanan */}
          <section
            className={`${glass} p-6 space-y-4`}
            style={{ overflow: "visible" }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              <MapPin size={13} /> Area Layanan
            </div>
            <p className="text-xs text-muted-foreground/60 -mt-2">
              Pilih area operasional toko kamu. Digunakan guide untuk mencari vendor berdasarkan lokasi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-1.5" style={{ position: "relative", zIndex: 30 }}>
                <Label className="text-xs text-muted-foreground">Kabupaten / Kota</Label>
                <SimpleSelect
                  items={kabupatens}
                  value={selKab}
                  onChange={handleKabChange}
                  placeholder="Pilih kabupaten…"
                />
              </div>
              <div className="grid gap-1.5" style={{ position: "relative", zIndex: 20 }}>
                <Label className="text-xs text-muted-foreground">Kecamatan</Label>
                <SimpleSelect
                  items={filteredKec}
                  value={selKec}
                  onChange={handleKecChange}
                  placeholder={selKab ? "Pilih kecamatan…" : "Pilih kabupaten dulu"}
                  disabled={!selKab}
                />
              </div>
              <div className="grid gap-1.5" style={{ position: "relative", zIndex: 10 }}>
                <Label className="text-xs text-muted-foreground">Kelurahan / Desa</Label>
                <SimpleSelect
                  items={filteredKel}
                  value={selKel}
                  onChange={(id) => setSelKel(id)}
                  placeholder={selKec ? "Pilih kelurahan…" : "Pilih kecamatan dulu"}
                  disabled={!selKec}
                />
              </div>
            </div>

            {selKab && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <MapPin size={12} className="text-primary/60 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {kabupatens.find(k => k.id === selKab)?.name ?? ""}
                  {selKec && ` › ${kecamatans.find(k => k.id === selKec)?.name ?? ""}`}
                  {selKel && ` › ${kelurahans.find(k => k.id === selKel)?.name ?? ""}`}
                </span>
                {selKel && (
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    area tersimpan
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Tombol Simpan di kiri bawah */}
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-10">
            {saving
              ? <><Loader2 size={14} className="animate-spin mr-2" />Menyimpan…</>
              : "Simpan Perubahan"
            }
          </Button>
        </div>

        {/* ── KANAN col-4 ── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Card Galeri Foto */}
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

          {/* Card Pengaturan Booking — dipindah ke sini di bawah Galeri */}
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

        </div>
      </div>
    </div>
  )
}
