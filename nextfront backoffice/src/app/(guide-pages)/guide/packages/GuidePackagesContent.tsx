'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { packagesBrowseService, PackageBrowse, DAY_OPTIONS, formatRupiah } from '@/services/packages-browse.service'
import { resolveUploadUrl } from '@/services/uploads.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, TrendingUp, Zap, Search, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'commission_desc', label: 'Komisi Terbesar' },
  { value: 'newest',          label: 'Terbaru' },
  { value: 'price_asc',       label: 'Harga Terendah' },
  { value: 'price_desc',      label: 'Harga Tertinggi' },
]

export default function GuidePackagesContent() {
  const [packages, setPackages] = useState<PackageBrowse[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Filters
  const [search,       setSearch]       = useState('')
  const [sort,         setSort]         = useState('commission_desc')
  const [day,          setDay]          = useState('')
  const [minPrice,     setMinPrice]     = useState('')
  const [maxPrice,     setMaxPrice]     = useState('')
  const [minDuration,  setMinDuration]  = useState('')
  const [maxDuration,  setMaxDuration]  = useState('')
  const [showFilters,  setShowFilters]  = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    packagesBrowseService.browse({
      search:       search || undefined,
      sort:         sort as never,
      available_day: day || undefined,
      min_price:    minPrice  ? Number(minPrice)  : undefined,
      max_price:    maxPrice  ? Number(maxPrice)  : undefined,
      min_duration: minDuration ? Number(minDuration) : undefined,
      max_duration: maxDuration ? Number(maxDuration) : undefined,
      limit: 50,
    })
      .then(setPackages)
      .catch(() => setError('Gagal memuat packages.'))
      .finally(() => setLoading(false))
  }, [search, sort, day, minPrice, maxPrice, minDuration, maxDuration])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jelajahi Package</h1>
        <p className="text-muted-foreground text-sm">Lihat semua package aktif dan estimasi komisi yang bisa kamu dapatkan.</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama package atau vendor…" className="pl-8" />
        </div>
        <select
          value={sort} onChange={e => setSort(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground focus:outline-none"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-muted-foreground hover:bg-white/10 transition-colors"
        >
          Filter <ChevronDown size={13} className={showFilters ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Hari Tersedia</label>
            <select value={day} onChange={e => setDay(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-foreground focus:outline-none">
              <option value="">Semua</option>
              {DAY_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Harga Min (Rp)</label>
            <Input value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number" className="h-8 text-xs" placeholder="0" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Harga Max (Rp)</label>
            <Input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number" className="h-8 text-xs" placeholder="–" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Durasi Min (mnt)</label>
            <Input value={minDuration} onChange={e => setMinDuration(e.target.value)} type="number" className="h-8 text-xs" placeholder="0" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Durasi Max (mnt)</label>
            <Input value={maxDuration} onChange={e => setMaxDuration(e.target.value)} type="number" className="h-8 text-xs" placeholder="–" />
          </div>
          <div className="col-span-full flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => { setDay(''); setMinPrice(''); setMaxPrice(''); setMinDuration(''); setMaxDuration('') }}>Reset</Button>
            <Button size="sm" onClick={load}>Terapkan Filter</Button>
          </div>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-64" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">Tidak ada package ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(p => <PackageCard key={p.id} pkg={p} />)}
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg: p }: { pkg: PackageBrowse }) {
  const cover = p.photo_urls[0] ? resolveUploadUrl(p.photo_urls[0]) : ''
  const days = p.available_days.slice(0, 4)
  const dayLabels: Record<string, string> = { Mon:'Sen', Tue:'Sel', Wed:'Rab', Thu:'Kam', Fri:'Jum', Sat:'Sab', Sun:'Min' }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-white/20 transition-all">
      {/* Cover */}
      <div className="relative h-36 bg-white/5">
        {cover ? (
          <Image src={cover} alt={p.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">🍽️</div>
        )}
        {p.vendor_allow_direct_booking && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Zap size={10} /> Direct
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{p.name}</h3>
        <p className="text-xs text-muted-foreground font-medium">{p.vendor_name}</p>
        {p.vendor_location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={10} /> {p.vendor_location}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {p.duration_minutes && (
            <span className="flex items-center gap-0.5"><Clock size={10} /> {p.duration_minutes} mnt</span>
          )}
          <span className="flex items-center gap-0.5"><Users size={10} /> min {p.min_pax} pax</span>
        </div>

        {/* Days */}
        {days.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {days.map(d => (
              <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-muted-foreground">{dayLabels[d] ?? d}</span>
            ))}
            {p.available_days.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-muted-foreground">+{p.available_days.length - 4}</span>
            )}
          </div>
        )}

        {/* Price & commission */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <div>
            <p className="text-xs text-muted-foreground">Harga/pax</p>
            <p className="text-sm font-semibold">{formatRupiah(p.price_per_pax)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Komisimu/pax</p>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <TrendingUp size={12} /> {formatRupiah(p.commission_per_pax)}
            </p>
            <p className="text-[10px] text-muted-foreground">{p.guide_percent}% dari harga</p>
          </div>
        </div>
      </div>
    </div>
  )
}
