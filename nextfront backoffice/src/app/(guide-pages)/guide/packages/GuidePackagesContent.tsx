'use client'
import { useEffect, useState, useCallback } from 'react'
import { packagesBrowseService, PackageBrowse, DAY_OPTIONS, formatRupiah } from '@/services/packages-browse.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock, Package, TrendingUp, Search, SlidersHorizontal, X, Users, CalendarDays } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest',          label: 'Terbaru' },
  { value: 'commission_desc', label: 'Komisi Terbesar' },
  { value: 'price_asc',       label: 'Harga Termurah' },
  { value: 'price_desc',      label: 'Harga Termahal' },
]

export default function GuidePackagesContent() {
  const [packages,  setPackages]  = useState<PackageBrowse[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('commission_desc')
  const [day,       setDay]       = useState('')
  const [error,     setError]     = useState('')
  const [selected,  setSelected]  = useState<PackageBrowse | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    packagesBrowseService.browse({
      search:        search || undefined,
      sort:          sort as never,
      available_day: day || undefined,
      limit:         60,
    })
      .then(res => setPackages(res.data))
      .catch(() => setError('Gagal memuat packages. Coba lagi.'))
      .finally(() => setLoading(false))
  }, [search, sort, day])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Packages</h1>
        <p className="text-muted-foreground text-sm">Temukan package terbaik dari semua vendor dan lihat potensi komisimu.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama package atau vendor…"
            className="pl-8"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground focus:outline-none"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={day}
          onChange={e => setDay(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground focus:outline-none"
        >
          <option value="">Semua Hari</option>
          {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button size="sm" onClick={load} variant="outline" className="gap-1.5">
          <SlidersHorizontal size={14} /> Terapkan
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-48" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">Tidak ada package ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(p => (
            <PackageCard key={p.id} pkg={p} onSelect={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <PackageDetailModal pkg={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function PackageCard({ pkg: p, onSelect }: { pkg: PackageBrowse; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/50 hover:bg-white/8 transition-all group w-full"
    >
      {/* Photo */}
      <div className="relative h-32 bg-white/5 flex items-center justify-center">
        {p.photo_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_urls[0]} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={40} className="text-white/10" />
        )}
        {p.vendor_allow_direct_booking && (
          <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Direct
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground">{p.vendor_name}</p>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{p.name}</h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {p.duration_minutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} /> {p.duration_minutes} min
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={11} /> min {p.min_pax} pax
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{formatRupiah(p.price_per_pax)}<span className="text-[10px]">/pax</span></span>
          {p.commission_per_pax > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp size={11} /> +{formatRupiah(p.commission_per_pax)}/pax
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function PackageDetailModal({ pkg: p, onClose }: { pkg: PackageBrowse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header photo */}
        {p.photo_urls?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_urls[0]} alt={p.name} className="w-full h-48 object-cover" />
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-emerald-400 font-medium">{p.vendor_name}</p>
            <h2 className="text-lg font-bold mt-0.5">{p.name}</h2>
          </div>

          {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Harga" value={`${formatRupiah(p.price_per_pax)} / pax`} />
            <InfoBox label="Komisi Guide" value={`${formatRupiah(p.commission_per_pax)} / pax`} highlight />
            <InfoBox label="Guide %" value={`${p.guide_percent}%`} />
            <InfoBox label="Durasi" value={p.duration_minutes ? `${p.duration_minutes} menit` : '–'} />
            <InfoBox label="Min Pax" value={String(p.min_pax)} />
            <InfoBox label="Max Pax" value={p.max_pax ? String(p.max_pax) : '–'} />
          </div>

          {p.available_days?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><CalendarDays size={12} /> Hari Tersedia</p>
              <div className="flex flex-wrap gap-1.5">
                {p.available_days.map(d => (
                  <span key={d} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {p.available_slots?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Slot Waktu</p>
              <div className="flex flex-wrap gap-1.5">
                {p.available_slots.map(s => (
                  <span key={s} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {p.terms && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Syarat & Ketentuan</p>
              <p className="text-xs text-foreground/80 whitespace-pre-line">{p.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
    </div>
  )
}
