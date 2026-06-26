"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { packagesService, PackageCreate } from "@/services/packages.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
const DAYS_ID: Record<string,string> = {
  Mon:'Senin', Tue:'Selasa', Wed:'Rabu',
  Thu:'Kamis', Fri:'Jumat', Sat:'Sabtu', Sun:'Minggu'
}

export default function PackageFormContent({ mode, packageId }: Props) {
  const router  = useRouter()
  const [form,    setForm]    = useState<PackageCreate>(EMPTY_FORM)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving,  setSaving]  = useState(false)
  const [slotInput, setSlotInput] = useState('')   // input tambah jam slot
  const [photoInput, setPhotoInput] = useState('') // input tambah URL foto

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
        .catch(() => toast.error('Gagal memuat data package.'))
        .finally(() => setLoading(false))
    }
  }, [mode, packageId])

  const set = (key: keyof PackageCreate, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleDay = (day: string) => {
    const days = form.available_days ?? []
    set('available_days', days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  const addSlot = () => {
    const val = slotInput.trim()
    if (!val) return
    const slots = form.available_slots ?? []
    if (!slots.includes(val)) set('available_slots', [...slots, val])
    setSlotInput('')
  }

  const removeSlot = (slot: string) =>
    set('available_slots', (form.available_slots ?? []).filter(s => s !== slot))

  const addPhoto = () => {
    const val = photoInput.trim()
    if (!val) return
    const urls = form.photo_urls ?? []
    if (!urls.includes(val)) set('photo_urls', [...urls, val])
    setPhotoInput('')
  }

  const removePhoto = (url: string) =>
    set('photo_urls', (form.photo_urls ?? []).filter(u => u !== url))

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Nama package wajib diisi.')
    if (!form.price_per_pax || form.price_per_pax <= 0) return toast.error('Harga per pax harus lebih dari 0.')
    if (form.max_pax && form.max_pax < form.min_pax) return toast.error('Max pax tidak boleh kurang dari min pax.')

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
    } catch (e: any) {
      toast.error(e?.message ?? 'Gagal menyimpan package.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground p-6">Memuat...</p>

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/vendor/packages">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Buat Package Baru' : 'Edit Package'}
          </h1>
          <p className="text-muted-foreground text-sm">Isi detail package yang ditawarkan ke guide.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">

        {/* Nama */}
        <div className="grid gap-1">
          <Label>Nama Package <span className="text-red-500">*</span></Label>
          <Input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="cth: Makan Siang Paket Wisata Bali"
          />
        </div>

        {/* Deskripsi */}
        <div className="grid gap-1">
          <Label>Deskripsi</Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Apa yang didapat tamu dalam package ini?"
          />
        </div>

        {/* Harga & Pax */}
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1">
            <Label>Harga / Pax (Rp) <span className="text-red-500">*</span></Label>
            <Input
              type="number" min={0}
              value={form.price_per_pax || ''}
              onChange={e => set('price_per_pax', Number(e.target.value))}
              placeholder="150000"
            />
          </div>
          <div className="grid gap-1">
            <Label>Min Pax</Label>
            <Input
              type="number" min={1}
              value={form.min_pax}
              onChange={e => set('min_pax', Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1">
            <Label>Max Pax <span className="text-xs text-muted-foreground">(kosong = tak terbatas)</span></Label>
            <Input
              type="number" min={1}
              value={form.max_pax ?? ''}
              onChange={e => set('max_pax', e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
            />
          </div>
        </div>

        {/* Durasi & Quota */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label>Durasi (menit) <span className="text-xs text-muted-foreground">(opsional)</span></Label>
            <Input
              type="number" min={1}
              value={form.duration_minutes ?? ''}
              onChange={e => set('duration_minutes', e.target.value ? Number(e.target.value) : null)}
              placeholder="cth: 90"
            />
          </div>
          <div className="grid gap-1">
            <Label>Quota per Slot <span className="text-xs text-muted-foreground">(max booking)</span></Label>
            <Input
              type="number" min={1}
              value={form.quota_per_slot}
              onChange={e => set('quota_per_slot', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Hari tersedia */}
        <div className="grid gap-2">
          <Label>Hari Tersedia <span className="text-xs text-muted-foreground">(panduan)</span></Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  (form.available_days ?? []).includes(day)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary'
                ].join(' ')}
              >
                {DAYS_ID[day]}
              </button>
            ))}
          </div>
        </div>

        {/* Slot jam */}
        <div className="grid gap-2">
          <Label>Slot Jam <span className="text-xs text-muted-foreground">(panduan)</span></Label>
          <div className="flex gap-2">
            <Input
              value={slotInput}
              onChange={e => setSlotInput(e.target.value)}
              placeholder="cth: 09:00"
              className="max-w-[120px]"
              onKeyDown={e => e.key === 'Enter' && addSlot()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addSlot}>Tambah</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.available_slots ?? []).map(slot => (
              <span key={slot} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                {slot}
                <button type="button" onClick={() => removeSlot(slot)} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Foto */}
        <div className="grid gap-2">
          <Label>Foto Package <span className="text-xs text-muted-foreground">(URL)</span></Label>
          <div className="flex gap-2">
            <Input
              value={photoInput}
              onChange={e => setPhotoInput(e.target.value)}
              placeholder="https://..."
              onKeyDown={e => e.key === 'Enter' && addPhoto()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addPhoto}>Tambah</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.photo_urls ?? []).map(url => (
              <div key={url} className="relative group">
                <img src={url} alt="" className="h-16 w-24 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Syarat */}
        <div className="grid gap-1">
          <Label>Syarat & Ketentuan <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            rows={3}
            value={form.terms}
            onChange={e => set('terms', e.target.value)}
            placeholder="cth: Minimal pemesanan H-1, tidak termasuk minuman, dll"
          />
        </div>

        {/* Catatan */}
        <div className="grid gap-1">
          <Label>Catatan Internal <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            rows={2}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Catatan internal untuk tim kamu"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving ? 'Menyimpan…' : mode === 'create' ? 'Buat Package' : 'Simpan Perubahan'}
          </Button>
          <Link href="/vendor/packages">
            <Button variant="outline" type="button">Batal</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
