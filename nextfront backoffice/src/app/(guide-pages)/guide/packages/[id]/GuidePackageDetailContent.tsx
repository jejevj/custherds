'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { packagesBrowseService, PackageBrowse, formatRupiah } from '@/services/packages-browse.service'
import { bookingsService } from '@/services/bookings.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft, Clock, Users, CalendarDays,
  TrendingUp, MapPin, ChevronLeft as Prev, ChevronRight as Next,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Photo Gallery ─────────────────────────────────────── */
function PhotoGallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0)
  if (!urls.length) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl text-white/10">
        📦
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[active]} alt="" className="w-full h-full object-cover" />
        {urls.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + urls.length) % urls.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            ><Prev size={16} /></button>
            <button
              onClick={() => setActive(i => (i + 1) % urls.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            ><Next size={16} /></button>
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {active + 1} / {urls.length}
            </span>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
                i === active ? 'border-emerald-500' : 'border-white/10 opacity-60 hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Booking Form ──────────────────────────────────────── */
function BookingForm({ pkg }: { pkg: PackageBrowse }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date,        setDate]        = useState('')
  const [time,        setTime]        = useState('')
  const [pax,         setPax]         = useState(pkg.min_pax)
  const [nationality, setNationality] = useState('')
  const [notes,       setNotes]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  const total = pax * pkg.price_per_pax
  const commission = pax * pkg.commission_per_pax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      await bookingsService.create({
        vendor_id:           pkg.vendor_id,
        product_id:          pkg.id,
        booking_date:        date,
        booking_time:        time || undefined,
        pax_count:           pax,
        tourist_nationality: nationality || undefined,
        notes:               notes || undefined,
      })
      setSuccess('Booking berhasil dibuat! Menunggu persetujuan vendor.')
      setTimeout(() => router.push('/guide/bookings'), 2000)
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || 'Gagal membuat booking.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5 sticky top-24">
      <div>
        <h2 className="font-bold text-base">Buat Booking</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Isi detail booking untuk tourist kamu</p>
      </div>

      {/* Price summary */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Harga / pax</span>
          <span>{formatRupiah(pkg.price_per_pax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Jumlah pax</span>
          <span>{pax}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-1.5 mt-1.5">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-emerald-400">
          <span className="flex items-center gap-1"><TrendingUp size={12} /> Komisi guide</span>
          <span>+{formatRupiah(commission)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error   && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

        <div className="grid gap-1.5">
          <Label className="text-xs">Tanggal Booking *</Label>
          <Input
            required type="date" min={today}
            value={date} onChange={e => setDate(e.target.value)}
          />
        </div>

        {pkg.available_slots?.length > 0 ? (
          <div className="grid gap-1.5">
            <Label className="text-xs">Slot Waktu *</Label>
            <select
              required
              value={time} onChange={e => setTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground focus:outline-none"
            >
              <option value="">Pilih slot…</option>
              {pkg.available_slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ) : (
          <div className="grid gap-1.5">
            <Label className="text-xs">Waktu (opsional)</Label>
            <Input
              type="time"
              value={time} onChange={e => setTime(e.target.value)}
            />
          </div>
        )}

        <div className="grid gap-1.5">
          <Label className="text-xs">Jumlah Pax * <span className="text-muted-foreground">(min {pkg.min_pax}{pkg.max_pax ? `, max ${pkg.max_pax}` : ''})</span></Label>
          <Input
            required type="number"
            min={pkg.min_pax} max={pkg.max_pax ?? undefined}
            value={pax} onChange={e => setPax(parseInt(e.target.value) || pkg.min_pax)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Kewarganegaraan Turis</Label>
          <Input
            value={nationality} onChange={e => setNationality(e.target.value)}
            placeholder="WNA / WNI"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Catatan</Label>
          <Input
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Opsional"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || !!success}>
          {loading ? 'Membuat booking…' : 'Buat Booking'}
        </Button>
      </form>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function GuidePackageDetailContent({ packageId }: { packageId: string }) {
  const router = useRouter()
  const [pkg,     setPkg]     = useState<PackageBrowse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    packagesBrowseService.browse({ limit: 100 })
      .then(list => {
        const found = list.find(p => p.id === packageId)
        if (found) setPkg(found)
        else setError('Package tidak ditemukan.')
      })
      .catch(() => setError('Gagal memuat data package.'))
      .finally(() => setLoading(false))
  }, [packageId])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
      <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
    </div>
  )

  if (error || !pkg) return (
    <div className="text-center py-24 space-y-3">
      <p className="text-muted-foreground">{error || 'Package tidak ditemukan.'}</p>
      <Button variant="outline" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={16} /> Kembali ke Packages
      </button>

      {/* 2-column layout: left=detail, right=booking */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT: Detail ── */}
        <div className="space-y-6">
          <PhotoGallery urls={pkg.photo_urls ?? []} />

          <div>
            <p className="text-sm text-emerald-400 font-medium flex items-center gap-1">
              <MapPin size={13} /> {pkg.vendor_name}{pkg.vendor_location ? ` · ${pkg.vendor_location}` : ''}
            </p>
            <h1 className="text-2xl font-bold mt-1">{pkg.name}</h1>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Harga" value={`${formatRupiah(pkg.price_per_pax)}/pax`} />
            <StatBox label="Komisi" value={`+${formatRupiah(pkg.commission_per_pax)}/pax`} highlight />
            {pkg.duration_minutes && <StatBox label="Durasi" value={`${pkg.duration_minutes} menit`} icon={<Clock size={13} />} />}
            <StatBox label="Min Pax" value={`${pkg.min_pax}${pkg.max_pax ? ` – ${pkg.max_pax}` : '+'} orang`} icon={<Users size={13} />} />
          </div>

          {pkg.description && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
            </div>
          )}

          {pkg.available_days?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><CalendarDays size={14} /> Hari Tersedia</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.available_days.map(d => (
                  <span key={d} className="text-xs bg-white/10 border border-white/10 px-3 py-1 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {pkg.available_slots?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Slot Waktu</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.available_slots.map(s => (
                  <span key={s} className="text-xs bg-white/10 border border-white/10 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {pkg.terms && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Syarat & Ketentuan</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{pkg.terms}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Booking Form ── */}
        <div>
          <BookingForm pkg={pkg} />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight, icon }: {
  label: string; value: string; highlight?: boolean; icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-3">
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">{icon}{label}</p>
      <p className={cn('text-sm font-semibold mt-1', highlight && 'text-emerald-400')}>{value}</p>
    </div>
  )
}
