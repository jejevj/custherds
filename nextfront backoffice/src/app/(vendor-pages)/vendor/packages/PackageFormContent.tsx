"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { packagesService, PackageCreate } from "@/services/packages.service"
import { uploadPhotos } from "@/services/uploads.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, ImagePlus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Props = {
  mode: 'create' | 'edit'
  packageId?: string
}

const EMPTY_FORM: PackageCreate = {
  name: '',
  description: '',
  price_per_pax: 0,
  min_pax: 1,
  max_pax: null,
  duration_minutes: null,
  available_days: [],
  available_slots: [],
  quota_per_slot: 1,
  terms: '',
  notes: '',
  photo_urls: [],
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const DAYS_ID: Record<string, string> = {
  Mon: 'Senin', Tue: 'Selasa', Wed: 'Rabu',
  Thu: 'Kamis', Fri: 'Jumat', Sat: 'Sabtu', Sun: 'Minggu',
}

const ALL_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const textareaClass =
  'w-full border border-white/10 rounded-lg px-3 py-2 text-sm resize-none bg-white/5 backdrop-blur-sm ' +
  'text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'

export default function PackageFormContent({ mode, packageId }: Props) {
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [form,        setForm]        = useState<PackageCreate>(EMPTY_FORM)
  const [loading,     setLoading]     = useState(mode === 'edit')
  const [saving,      setSaving]      = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const [showPicker,  setShowPicker]  = useState(false)

  // local preview blobs sebelum upload
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (mode === 'edit' && packageId) {
      packagesService.getOne(packageId)
        .then(pkg => setForm({
          name:             pkg.name,
          description:      pkg.description ?? '',
          price_per_pax:    Number(pkg.price_per_pax),
          min_pax:          pkg.min_pax,
          max_pax:          pkg.max_pax,
          duration_minutes: pkg.duration_minutes,
          available_days:   pkg.available_days ?? [],
          available_slots:  pkg.available_slots ?? [],
          quota_per_slot:   pkg.quota_per_slot,
          terms:            pkg.terms ?? '',
          notes:            pkg.notes ?? '',
          photo_urls:       pkg.photo_urls ?? [],
        }))
        .catch(() => setError('Gagal memuat data package.'))
        .finally(() => setLoading(false))
    }
  }, [mode, packageId])

  // revoke object URLs on unmount
  useEffect(() => () => { previews.forEach(p => URL.revokeObjectURL(p.preview)) }, [])

  const set = <K extends keyof PackageCreate>(key: K, value: PackageCreate[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleDay = (day: string) => {
    const days = form.available_days
    set('available_days', days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  const toggleSlot = (slot: string) => {
    const slots = form.available_slots
    set('available_slots', slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot].sort())
  }

  // Pilih file → simpan di previews, belum upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    const newPreviews = selected.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setPreviews(prev => [...prev, ...newPreviews])
    e.target.value = '' // reset input agar bisa pilih file sama lagi
  }

  const removePreview = (idx: number) => {
    URL.revokeObjectURL(previews[idx].preview)
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const removeUploaded = (url: string) =>
    set('photo_urls', form.photo_urls.filter(u => u !== url))

  // Upload semua file di previews
  const handleUploadPreviews = async () => {
    if (!previews.length) return
    setUploading(true)
    try {
      const urls = await uploadPhotos(previews.map(p => p.file))
      set('photo_urls', [...form.photo_urls, ...urls])
      previews.forEach(p => URL.revokeObjectURL(p.preview))
      setPreviews([])
      toast.success(`${urls.length} foto berhasil diupload.`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload foto gagal.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError(''); setSuccess(false)
    if (previews.length > 0)
      return setError('Upload foto yang belum diupload terlebih dahulu.')
    if (!form.name.trim())
      return setError('Nama package wajib diisi.')
    if (!form.price_per_pax || form.price_per_pax <= 0)
      return setError('Harga per pax harus lebih dari 0.')
    if (form.max_pax !== null && form.max_pax < form.min_pax)
      return setError('Max pax tidak boleh kurang dari min pax.')

    setSaving(true)
    try {
      if (mode === 'create') {
        await packagesService.create(form)
        toast.success('Package berhasil dibuat!')
      } else {
        await packagesService.update(packageId!, form)
        toast.success('Package berhasil diupdate!')
      }
      router.push('/vendor/packages')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan package.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Memuat...</p>

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/vendor/packages" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Buat Package Baru' : 'Edit Package'}
          </h1>
          <p className="text-muted-foreground">Isi detail package yang ditawarkan ke guide.</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-6 space-y-5">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">Package berhasil disimpan.</p>}

        {/* Nama */}
        <div className="grid gap-1.5">
          <Label>Nama Package</Label>
          <Input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="cth: Makan Siang Paket Wisata Bali" />
        </div>

        {/* Deskripsi */}
        <div className="grid gap-1.5">
          <Label>Deskripsi</Label>
          <textarea className={textareaClass} rows={3}
            value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Apa yang didapat tamu dalam package ini?" />
        </div>

        {/* Harga */}
        <div className="grid gap-1.5">
          <Label>Harga per Pax (Rp)</Label>
          <Input type="number" min={0} value={form.price_per_pax || ''}
            onChange={e => set('price_per_pax', Number(e.target.value))} placeholder="150000" />
        </div>

        {/* Min & Max Pax */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Min Pax</Label>
            <Input type="number" min={1} value={form.min_pax}
              onChange={e => set('min_pax', Number(e.target.value))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Max Pax <span className="text-xs text-muted-foreground ml-1">(kosong = tak terbatas)</span></Label>
            <Input type="number" min={1} value={form.max_pax ?? ''} placeholder="—"
              onChange={e => set('max_pax', e.target.value ? Number(e.target.value) : null)} />
          </div>
        </div>

        {/* Durasi & Quota */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Durasi <span className="text-xs text-muted-foreground ml-1">(menit)</span></Label>
            <Input type="number" min={1} value={form.duration_minutes ?? ''} placeholder="cth: 90"
              onChange={e => set('duration_minutes', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Quota per Slot <span className="text-xs text-muted-foreground ml-1">(max booking)</span></Label>
            <Input type="number" min={1} value={form.quota_per_slot}
              onChange={e => set('quota_per_slot', Number(e.target.value))} />
          </div>
        </div>

        {/* Hari tersedia */}
        <div className="grid gap-2">
          <Label>Hari Tersedia</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => {
              const active = form.available_days.includes(day)
              return (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={[
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    active
                      ? 'bg-primary/90 text-primary-foreground border-primary shadow-sm'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20',
                  ].join(' ')}
                >{DAYS_ID[day]}</button>
              )
            })}
          </div>
        </div>

        {/* Slot jam */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Slot Jam</Label>
            <button type="button" onClick={() => setShowPicker(p => !p)}
              className="text-xs text-primary hover:underline">
              {showPicker ? 'Tutup picker' : 'Pilih dari daftar jam'}
            </button>
          </div>
          {showPicker && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                {ALL_SLOTS.map(slot => {
                  const active = form.available_slots.includes(slot)
                  return (
                    <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                      className={[
                        'py-1 rounded-md text-xs font-medium border transition-all',
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10',
                      ].join(' ')}
                    >{slot}</button>
                  )
                })}
              </div>
            </div>
          )}
          {form.available_slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.available_slots.map(slot => (
                <span key={slot}
                  className="flex items-center gap-1 border border-white/10 bg-white/5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground">
                  {slot}
                  <button type="button" onClick={() => toggleSlot(slot)}
                    className="hover:text-destructive ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Foto Package ────────────────────────────────────── */}
        <div className="grid gap-2">
          <Label>Foto Package</Label>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Tombol pilih file */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 w-full justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors px-4 py-6 text-sm text-muted-foreground"
          >
            <ImagePlus size={18} />
            Klik untuk pilih foto (JPG, PNG, WebP · maks 5MB/foto)
          </button>

          {/* Preview foto yang belum diupload */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{previews.length} foto dipilih, belum diupload</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {previews.map((p, i) => (
                  <div key={i} className="relative group aspect-square">
                    <Image
                      src={p.preview} alt=""
                      fill className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    ><X size={10} /></button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={handleUploadPreviews}
                disabled={uploading}
                size="sm"
                className="w-full"
              >
                {uploading
                  ? <><Loader2 size={14} className="animate-spin mr-1.5" />Mengupload...</>
                  : `Upload ${previews.length} foto`
                }
              </Button>
            </div>
          )}

          {/* Foto yang sudah terupload */}
          {form.photo_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {form.photo_urls.map(url => (
                <div key={url} className="relative group aspect-square">
                  <Image
                    src={url} alt=""
                    fill className="object-cover rounded-lg"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeUploaded(url)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syarat */}
        <div className="grid gap-1.5">
          <Label>Syarat & Ketentuan <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea className={textareaClass} rows={3}
            value={form.terms} onChange={e => set('terms', e.target.value)}
            placeholder="cth: Minimal pemesanan H-1, tidak termasuk minuman" />
        </div>

        {/* Catatan internal */}
        <div className="grid gap-1.5">
          <Label>Catatan Internal <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea className={textareaClass} rows={2}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Catatan internal untuk tim kamu" />
        </div>

        <Button onClick={handleSubmit} disabled={saving || uploading} className="w-full">
          {saving ? 'Menyimpan…' : mode === 'create' ? 'Buat Package' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  )
}
