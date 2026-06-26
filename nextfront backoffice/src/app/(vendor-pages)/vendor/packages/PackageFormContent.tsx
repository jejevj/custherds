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
const DAYS_ID: Record<string, string> = {
  Mon: 'Senin', Tue: 'Selasa', Wed: 'Rabu',
  Thu: 'Kamis', Fri: 'Jumat', Sat: 'Sabtu', Sun: 'Minggu',
}

const textareaClass =
  "w-full border border-white/10 rounded-lg px-3 py-2 text-sm resize-none bg-white/5 backdrop-blur-sm " +
  "text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

export default function PackageFormContent({ mode, packageId }: Props) {
  const router = useRouter()
  const [form,       setForm]       = useState<PackageCreate>(EMPTY_FORM)
  const [loading,    setLoading]    = useState(mode === 'edit')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)
  const [slotInput,  setSlotInput]  = useState('')
  const [photoInput, setPhotoInput] = useState('')

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

  const set = <K extends keyof PackageCreate>(key: K, value: PackageCreate[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleDay = (day: string) => {
    const days = form.available_days
    set('available_days', days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  const addSlot = () => {
    const val = slotInput.trim()
    if (!val) return
    if (!form.available_slots.includes(val))
      set('available_slots', [...form.available_slots, val])
    setSlotInput('')
  }

  const removeSlot = (slot: string) =>
    set('available_slots', form.available_slots.filter(s => s !== slot))

  const addPhoto = () => {
    const val = photoInput.trim()
    if (!val) return
    if (!form.photo_urls.includes(val))
      set('photo_urls', [...form.photo_urls, val])
    setPhotoInput('')
  }

  const removePhoto = (url: string) =>
    set('photo_urls', form.photo_urls.filter(u => u !== url))

  const handleSubmit = async () => {
    setError(''); setSuccess(false)
    if (!form.name.trim())                              return setError('Nama package wajib diisi.')
    if (!form.price_per_pax || form.price_per_pax <= 0) return setError('Harga per pax harus lebih dari 0.')
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

      {/* Card — glassmorphism, full width */}
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-6 space-y-5">
        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">Package berhasil disimpan.</p>}

        {/* Nama */}
        <div className="grid gap-1.5">
          <Label>Nama Package</Label>
          <Input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="cth: Makan Siang Paket Wisata Bali"
          />
        </div>

        {/* Deskripsi */}
        <div className="grid gap-1.5">
          <Label>Deskripsi</Label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Apa yang didapat tamu dalam package ini?"
          />
        </div>

        {/* Harga */}
        <div className="grid gap-1.5">
          <Label>Harga per Pax (Rp)</Label>
          <Input
            type="number" min={0}
            value={form.price_per_pax || ''}
            onChange={e => set('price_per_pax', Number(e.target.value))}
            placeholder="150000"
          />
        </div>

        {/* Min & Max Pax */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Min Pax</Label>
            <Input
              type="number" min={1}
              value={form.min_pax}
              onChange={e => set('min_pax', Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>
              Max Pax
              <span className="text-xs text-muted-foreground ml-1">(kosong = tak terbatas)</span>
            </Label>
            <Input
              type="number" min={1}
              value={form.max_pax ?? ''}
              onChange={e => set('max_pax', e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
            />
          </div>
        </div>

        {/* Durasi & Quota */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>
              Durasi
              <span className="text-xs text-muted-foreground ml-1">(menit)</span>
            </Label>
            <Input
              type="number" min={1}
              value={form.duration_minutes ?? ''}
              onChange={e => set('duration_minutes', e.target.value ? Number(e.target.value) : null)}
              placeholder="cth: 90"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>
              Quota per Slot
              <span className="text-xs text-muted-foreground ml-1">(max booking)</span>
            </Label>
            <Input
              type="number" min={1}
              value={form.quota_per_slot}
              onChange={e => set('quota_per_slot', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Hari tersedia */}
        <div className="grid gap-2">
          <Label>Hari Tersedia</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => {
              const active = form.available_days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={[
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    active
                      ? 'bg-primary/90 text-primary-foreground border-primary shadow-sm'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20',
                  ].join(' ')}
                >
                  {DAYS_ID[day]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Slot jam */}
        <div className="grid gap-2">
          <Label>Slot Jam</Label>
          <div className="flex gap-2">
            <Input
              value={slotInput}
              onChange={e => setSlotInput(e.target.value)}
              placeholder="cth: 09:00"
              className="max-w-[140px]"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSlot() } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addSlot}>Tambah</Button>
          </div>
          {form.available_slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.available_slots.map(slot => (
                <span
                  key={slot}
                  className="flex items-center gap-1 border border-white/10 bg-white/5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {slot}
                  <button
                    type="button"
                    onClick={() => removeSlot(slot)}
                    className="hover:text-destructive ml-0.5"
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Foto URL */}
        <div className="grid gap-2">
          <Label>Foto Package <span className="text-xs text-muted-foreground">(URL)</span></Label>
          <div className="flex gap-2">
            <Input
              value={photoInput}
              onChange={e => setPhotoInput(e.target.value)}
              placeholder="https://..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhoto() } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addPhoto}>Tambah</Button>
          </div>
          {form.photo_urls.length > 0 && (
            <div className="space-y-1.5">
              {form.photo_urls.map(url => (
                <div
                  key={url}
                  className="flex items-center justify-between border border-white/10 bg-white/5 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="text-xs text-muted-foreground hover:text-destructive ml-3 shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syarat */}
        <div className="grid gap-1.5">
          <Label>Syarat & Ketentuan <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.terms}
            onChange={e => set('terms', e.target.value)}
            placeholder="cth: Minimal pemesanan H-1, tidak termasuk minuman"
          />
        </div>

        {/* Catatan internal */}
        <div className="grid gap-1.5">
          <Label>Catatan Internal <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <textarea
            className={textareaClass}
            rows={2}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Catatan internal untuk tim kamu"
          />
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? 'Menyimpan…' : mode === 'create' ? 'Buat Package' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  )
}
