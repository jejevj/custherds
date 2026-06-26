'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { packagesBrowseService, PackageBrowse, DAY_OPTIONS, formatRupiah } from '@/services/packages-browse.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock, Package, TrendingUp, Search, SlidersHorizontal, Users } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest',          label: 'Terbaru' },
  { value: 'commission_desc', label: 'Komisi Terbesar' },
  { value: 'price_asc',       label: 'Harga Termurah' },
  { value: 'price_desc',      label: 'Harga Termahal' },
]

export default function GuidePackagesContent() {
  const router = useRouter()
  const [packages,  setPackages]  = useState<PackageBrowse[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('commission_desc')
  const [day,       setDay]       = useState('')
  const [error,     setError]     = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    packagesBrowseService.browse({
      search:        search || undefined,
      sort:          sort as never,
      available_day: day || undefined,
      limit:         60,
    })
      .then(res => setPackages(res))
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
            <PackageCard
              key={p.id}
              pkg={p}
              onClick={() => router.push(`/guide/packages/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg: p, onClick }: { pkg: PackageBrowse; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/50 hover:bg-white/[0.08] transition-all w-full group"
    >
      {/* Photo */}
      <div className="relative h-32 bg-white/5 flex items-center justify-center overflow-hidden">
        {p.photo_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo_urls[0]} alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package size={40} className="text-white/10" />
        )}
        {p.photo_urls?.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            +{p.photo_urls.length - 1} foto
          </span>
        )}
        {p.vendor_allow_direct_booking && (
          <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Direct
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground truncate">{p.vendor_name}</p>
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
          <span className="text-xs text-muted-foreground">
            {formatRupiah(p.price_per_pax)}<span className="text-[10px]">/pax</span>
          </span>
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
