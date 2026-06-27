'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vendorsBrowseService, VendorPublic, resolveCoverPhoto } from '@/services/vendors.service'
import { formatRupiah } from '@/services/packages-browse.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Package, TrendingUp, Zap, Search, SlidersHorizontal } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'name',            label: 'Nama A–Z' },
  { value: 'commission_desc', label: 'Komisi Terbesar' },
  { value: 'packages_desc',   label: 'Package Terbanyak' },
]

const selectClass = 'h-9 rounded-lg border border-white/10 bg-background px-3 text-sm text-foreground focus:outline-none'

export default function GuideVendorsContent() {
  const [vendors,    setVendors]    = useState<VendorPublic[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [sort,       setSort]       = useState('commission_desc')
  const [directOnly, setDirectOnly] = useState(false)
  const [error,      setError]      = useState('')

  const load = useCallback(() => {
    setLoading(true)
    vendorsBrowseService.browse({
      search,
      sort: sort as never,
      allow_direct: directOnly || undefined,
      limit: 50,
    })
      .then(setVendors)
      .catch(() => setError('Gagal memuat vendor.'))
      .finally(() => setLoading(false))
  }, [search, sort, directOnly])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jelajahi Vendor</h1>
        <p className="text-muted-foreground text-sm">Temukan vendor terbaik dan lihat potensi komisimu.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama vendor…"
            className="pl-8"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className={selectClass}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setDirectOnly(d => !d)}
          className={[
            'flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors',
            directOnly
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10',
          ].join(' ')}
        >
          <Zap size={13} /> Direct Booking
        </button>
        <Button size="sm" onClick={load} variant="outline" className="gap-1.5">
          <SlidersHorizontal size={14} /> Terapkan
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-56" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">Tidak ada vendor ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
        </div>
      )}
    </div>
  )
}

function VendorCard({ vendor: v }: { vendor: VendorPublic }) {
  const cover = resolveCoverPhoto(v.cover_photo)
  return (
    <Link
      href={`/guide/vendors/${v.id}`}
      className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/20 transition-all group cursor-pointer"
    >
      <div className="relative h-36 bg-white/5">
        {cover ? (
          <Image src={cover} alt={v.vendor_business_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">🏪</div>
        )}
        {v.allow_direct_booking && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Zap size={10} /> Direct
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">{v.vendor_business_name}</h3>
        {v.vendor_location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} /> {v.vendor_location}
          </p>
        )}
        {v.vendor_short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{v.vendor_short_description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package size={11} /> {v.package_count} package
          </span>
          {v.max_commission_per_pax != null && v.max_commission_per_pax > 0 ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp size={11} /> +{formatRupiah(v.max_commission_per_pax)}/pax
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">–</span>
          )}
        </div>
      </div>
    </Link>
  )
}
