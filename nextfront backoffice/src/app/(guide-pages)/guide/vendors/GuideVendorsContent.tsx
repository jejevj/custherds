'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vendorsBrowseService, VendorPublic, resolveCoverPhoto } from '@/services/vendors.service'
import { vendorCategoriesService, VendorCategory } from '@/services/vendorCategories.service'
import {
  vendorAreasService,
  VendorAreaKabupaten,
  VendorAreaKecamatan,
  VendorAreaKelurahan,
} from '@/services/vendorAreas.service'
import { formatRupiah } from '@/services/packages-browse.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Package, TrendingUp, Zap, Search, SlidersHorizontal, Tag, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'name',            label: 'Nama A–Z' },
  { value: 'commission_desc', label: 'Komisi Terbesar' },
  { value: 'packages_desc',   label: 'Package Terbanyak' },
]

const selectCls = [
  'h-9 rounded-lg border border-white/10 bg-background px-3 text-sm text-foreground',
  'focus:outline-none focus:ring-2 focus:ring-primary/30',
].join(' ')

export default function GuideVendorsContent() {
  const [vendors,    setVendors]    = useState<VendorPublic[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [sort,       setSort]       = useState('commission_desc')
  const [directOnly, setDirectOnly] = useState(false)
  const [error,      setError]      = useState('')

  // ── Category filter ─────────────────────────────────────────
  const [categories,  setCategories]  = useState<VendorCategory[]>([])
  const [selCategory, setSelCategory] = useState<number | ''>('')

  // ── Area filter (cascade) ─────────────────────────────────
  const [kabupatens, setKabupatens] = useState<VendorAreaKabupaten[]>([])
  const [kecamatans, setKecamatans] = useState<VendorAreaKecamatan[]>([])
  const [kelurahans, setKelurahans] = useState<VendorAreaKelurahan[]>([])
  const [selKab, setSelKab] = useState<number | ''>('')
  const [selKec, setSelKec] = useState<number | ''>('')
  const [selKel, setSelKel] = useState<number | ''>('')

  const filteredKec = useMemo(
    () => selKab ? kecamatans.filter(k => k.kabupaten_id === selKab) : [],
    [kecamatans, selKab],
  )
  const filteredKel = useMemo(
    () => selKec ? kelurahans.filter(k => k.kecamatan_id === selKec) : [],
    [kelurahans, selKec],
  )

  // area_id yang dikirim ke API = level terspesifik yang dipilih
  const effectiveArea: number | undefined = selKel || selKec || selKab || undefined

  // apakah ada filter aktif
  const hasFilter = !!selCategory || !!selKab || directOnly

  const clearFilters = () => {
    setSelCategory('')
    setSelKab(''); setSelKec(''); setSelKel('')
    setDirectOnly(false)
  }

  // Load lookup data sekali
  useEffect(() => {
    Promise.all([
      vendorCategoriesService.list({ is_active: true }),
      vendorAreasService.listKabupaten(),
      vendorAreasService.listKecamatan(),
      vendorAreasService.listKelurahan(),
    ]).then(([cats, kabs, kecs, kels]) => {
      setCategories([...cats].sort((a, b) =>
        a.group_name.localeCompare(b.group_name) || a.sort_order - b.sort_order,
      ))
      setKabupatens(kabs.filter(k => k.is_active))
      setKecamatans(kecs.filter(k => k.is_active))
      setKelurahans(kels.filter(k => k.is_active))
    })
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    vendorsBrowseService.browse({
      search:       search || undefined,
      sort:         sort as never,
      allow_direct: directOnly || undefined,
      category:     selCategory || undefined,
      area:         effectiveArea,
      limit:        50,
    })
      .then(setVendors)
      .catch(() => setError('Gagal memuat vendor.'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, directOnly, selCategory, effectiveArea])

  useEffect(() => { load() }, [load])

  // Group categories untuk <optgroup>
  const groupedCats = useMemo(() => {
    const map = new Map<string, VendorCategory[]>()
    categories.forEach(c => {
      if (!map.has(c.group_name)) map.set(c.group_name, [])
      map.get(c.group_name)!.push(c)
    })
    return Array.from(map.entries())
  }, [categories])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jelajahi Vendor</h1>
        <p className="text-muted-foreground text-sm">Temukan vendor terbaik dan lihat potensi komisimu.</p>
      </div>

      {/* ── Filter bar ── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3">

        {/* Baris 1: Search + Sort + Direct */}
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
          <select value={sort} onChange={e => setSort(e.target.value)} className={selectCls}>
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
        </div>

        {/* Baris 2: Kategori + Area Cascade */}
        <div className="flex flex-wrap gap-3 items-end">

          {/* Kategori */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
              <Tag size={10} /> Kategori
            </label>
            <select
              value={selCategory}
              onChange={e => setSelCategory(e.target.value ? Number(e.target.value) : '')}
              className={selectCls}
            >
              <option value="">Semua kategori</option>
              {groupedCats.map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Kabupaten */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
              <MapPin size={10} /> Kabupaten / Kota
            </label>
            <select
              value={selKab}
              onChange={e => {
                const v = e.target.value ? Number(e.target.value) : ''
                setSelKab(v); setSelKec(''); setSelKel('')
              }}
              className={selectCls}
            >
              <option value="">Semua wilayah</option>
              {kabupatens.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Kecamatan */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] text-muted-foreground/70">Kecamatan</label>
            <select
              value={selKec}
              onChange={e => {
                const v = e.target.value ? Number(e.target.value) : ''
                setSelKec(v); setSelKel('')
              }}
              disabled={!selKab}
              className={[selectCls, !selKab ? 'opacity-40 cursor-not-allowed' : ''].join(' ')}
            >
              <option value="">{selKab ? 'Semua kecamatan' : '— Pilih kabupaten dulu'}</option>
              {filteredKec.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Kelurahan */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] text-muted-foreground/70">Kelurahan / Desa</label>
            <select
              value={selKel}
              onChange={e => setSelKel(e.target.value ? Number(e.target.value) : '')}
              disabled={!selKec}
              className={[selectCls, !selKec ? 'opacity-40 cursor-not-allowed' : ''].join(' ')}
            >
              <option value="">{selKec ? 'Semua kelurahan' : '— Pilih kecamatan dulu'}</option>
              {filteredKel.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Tombol reset filter */}
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors self-end"
            >
              <X size={12} /> Reset
            </button>
          )}

          <Button size="sm" onClick={load} variant="outline" className="gap-1.5 self-end">
            <SlidersHorizontal size={14} /> Terapkan
          </Button>
        </div>

        {/* Active filter chips */}
        {(selCategory || selKab) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selCategory && (() => {
              const cat = categories.find(c => c.id === selCategory)
              return cat ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                  <Tag size={10} /> {cat.name}
                  <button onClick={() => setSelCategory('')} className="hover:text-primary/60"><X size={10} /></button>
                </span>
              ) : null
            })()}
            {selKab && (() => {
              const kab = kabupatens.find(k => k.id === selKab)
              const kec = kecamatans.find(k => k.id === selKec)
              const kel = kelurahans.find(k => k.id === selKel)
              const label = [kab?.name, kec?.name, kel?.name].filter(Boolean).join(' › ')
              return (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                  <MapPin size={10} /> {label}
                  <button onClick={() => { setSelKab(''); setSelKec(''); setSelKel('') }} className="hover:text-primary/60"><X size={10} /></button>
                </span>
              )
            })()}
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Jumlah hasil */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {vendors.length} vendor ditemukan
        </p>
      )}

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
