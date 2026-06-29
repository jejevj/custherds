'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vendorsBrowseService, VendorDetail, PackagePublic, resolveCoverPhoto } from '@/services/vendors.service'
import { formatRupiah } from '@/services/packages-browse.service'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Clock, Globe, Phone, Zap,
  TrendingUp, Users, Timer, ChevronRight, Package, Images, CalendarDays, X,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type NavItem = { id: string; label: string; icon: React.ReactNode }

const NAV_ITEMS: NavItem[] = [
  { id: 'gallery',  label: 'Galeri',  icon: <Images  size={14} /> },
  { id: 'packages', label: 'Paket',   icon: <Package size={14} /> },
]

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function GuideVendorDetailContent({ vendorId }: { vendorId: string }) {
  const [vendor,   setVendor]   = useState<VendorDetail | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('gallery')
  const [showDirectModal, setShowDirectModal] = useState(false)

  const sectionRefs: Record<string, React.RefObject<HTMLElement>> = {
    gallery:  useRef<HTMLElement>(null!),
    packages: useRef<HTMLElement>(null!),
  }

  useEffect(() => {
    setLoading(true)
    vendorsBrowseService
      .getDetail(vendorId)
      .then(setVendor)
      .catch(() => setError('Gagal memuat detail vendor.'))
      .finally(() => setLoading(false))
  }, [vendorId])

  // Scroll-spy: track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    Object.values(sectionRefs).forEach((r) => { if (r.current) observer.observe(r.current) })
    return () => observer.disconnect()
  }, [vendor])

  function scrollTo(id: string) {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(id)
  }

  if (loading) return (
    <div className="space-y-8">
      <div className="h-8 w-36 rounded-xl bg-white/5 animate-pulse" />
      <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 animate-pulse">
        <div className="h-56" />
        <div className="p-6 space-y-3">
          <div className="h-6 w-48 rounded-lg bg-white/10" />
          <div className="h-4 w-72 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  )

  if (error || !vendor) return (
    <div className="flex flex-col gap-5 items-start">
      <Link href="/guide/vendors">
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <ArrowLeft size={14} /> Kembali
        </Button>
      </Link>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        {error || 'Vendor tidak ditemukan.'}
      </div>
    </div>
  )

  const cover   = resolveCoverPhoto(vendor.cover_photo)
  const gallery = (vendor.gallery_urls ?? []).map(resolveCoverPhoto).filter(Boolean)

  return (
    <div className="pb-10">

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            onClick={() => setLightbox(null)}
          >×</button>
        </div>
      )}

      {/* ── Direct Booking Modal ──────────────────────────────────── */}
      {showDirectModal && vendor && (
        <DirectBookingModal
          vendor={vendor}
          onClose={() => setShowDirectModal(false)}
        />
      )}

      {/* ── Back ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link href="/guide/vendors">
          <Button variant="ghost" size="sm" className="gap-2 -ml-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Semua Vendor
          </Button>
        </Link>
      </div>

      {/* ── Hero card ───────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden mb-8">
        <div className="relative h-52 sm:h-64 bg-white/5">
          {cover ? (
            <Image src={cover} alt={vendor.vendor_business_name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-10">🏪</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">
              {vendor.vendor_business_name}
            </h1>
            {vendor.allow_direct_booking && (
              <span className="shrink-0 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                <Zap size={11} /> Direct Booking
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {vendor.vendor_short_description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{vendor.vendor_short_description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {vendor.vendor_location && (
              <InfoPill icon={<MapPin size={12} />}>{vendor.vendor_location}</InfoPill>
            )}
            {vendor.vendor_opening_hours && (
              <InfoPill icon={<Clock size={12} />}>{vendor.vendor_opening_hours}</InfoPill>
            )}
            {vendor.vendor_contact_person && (
              <InfoPill icon={<Phone size={12} />}>{vendor.vendor_contact_person}</InfoPill>
            )}
            {vendor.vendor_website && (
              <a
                href={vendor.vendor_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <Globe size={12} /> {vendor.vendor_website}
              </a>
            )}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/5">
            {vendor.vendor_min_spend ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Min. spend:</span>
                <span className="font-semibold text-foreground">{formatRupiah(Number(vendor.vendor_min_spend))}</span>
              </div>
            ) : <div />}

            {/* Direct Booking CTA — hanya jika flag aktif */}
            {vendor.allow_direct_booking && (
              <Button
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                onClick={() => setShowDirectModal(true)}
              >
                <CalendarDays size={14} /> Book Jadwal (Direct)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-column layout: sticky nav left + content right ────────── */}
      <div className="flex gap-8 items-start">

        {/* Left sticky nav */}
        <aside className="hidden md:flex flex-col gap-1 sticky top-24 w-44 shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">Navigasi</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={[
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full',
                activeNav === item.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent',
              ].join(' ')}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* ── Gallery ─────────────────────────────────────────────── */}
          <section ref={sectionRefs.gallery} id="gallery" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-3">
              <Images size={16} className="text-muted-foreground" />
              <h2 className="text-base font-semibold">
                Galeri Tempat
                <span className="ml-2 text-xs font-normal text-muted-foreground">({gallery.length} foto)</span>
              </h2>
            </div>
            {gallery.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-10 text-center text-sm text-muted-foreground">
                Belum ada foto galeri.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(url)}
                    className={[
                      'relative overflow-hidden rounded-2xl bg-white/5 border border-white/10',
                      'hover:border-white/30 hover:scale-[1.02] transition-all duration-200',
                      i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square',
                    ].join(' ')}
                  >
                    <Image src={url} alt={`Galeri ${i + 1}`} fill className="object-cover" unoptimized />
                    {i === gallery.length - 1 && gallery.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">+{gallery.length - 4} foto</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Packages ────────────────────────────────────────────── */}
          <section ref={sectionRefs.packages} id="packages" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-muted-foreground" />
              <h2 className="text-base font-semibold">
                Paket Tersedia
                <span className="ml-2 text-xs font-normal text-muted-foreground">({vendor.packages.length})</span>
              </h2>
            </div>
            {vendor.packages.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-10 text-center text-sm text-muted-foreground">
                Belum ada paket aktif dari vendor ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {vendor.packages.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg} vendorId={vendor.id} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Direct Booking Modal
// ─────────────────────────────────────────────────────────────────────────────
function DirectBookingModal({ vendor, onClose }: { vendor: VendorDetail; onClose: () => void }) {
  const [date,        setDate]        = useState('')
  const [time,        setTime]        = useState('')
  const [pax,         setPax]         = useState(1)
  const [tourists,    setTourists]    = useState('')
  const [nationality, setNationality] = useState('')
  const [notes,       setNotes]       = useState('')
  const [amount,      setAmount]      = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    setSubmitting(true)
    // TODO: ganti dengan real API call
    // POST /api/guide/bookings
    // payload: { vendor_id: vendor.id, product_id: null, booking_date: date,
    //            booking_time: time || null, pax_count: pax,
    //            tourist_names: tourists, tourist_nationality: nationality,
    //            notes, estimated_amount: amount || null }
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Direct Booking</p>
            <h3 className="text-base font-semibold leading-tight mt-0.5">{vendor.vendor_business_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
            <div className="text-5xl">✅</div>
            <h4 className="text-lg font-semibold">Booking Terkirim!</h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Booking jadwal ke{' '}
              <span className="text-foreground font-medium">{vendor.vendor_business_name}</span>{' '}
              berhasil dibuat. Tunggu konfirmasi dari vendor.
            </p>
            <Button size="sm" className="mt-2 rounded-xl" onClick={onClose}>Tutup</Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* Info box */}
            <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-300/80 leading-relaxed">
              <Zap size={12} className="inline mr-1.5 mb-0.5" />
              <strong>Direct Booking</strong> — tidak terikat paket. Turis bayar langsung ke vendor,
              lalu kamu tulis nominal tagihan secara manual saat upload kuitansi.
            </div>

            {/* Tanggal & Jam */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Tanggal Kunjungan <span className="text-red-400">*</span>
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Jam (opsional)</span>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                />
              </label>
            </div>

            {/* Jumlah pax */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Jumlah Turis (pax) <span className="text-red-400">*</span>
              </span>
              <input
                type="number"
                min={1}
                required
                value={pax}
                onChange={e => setPax(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500/50"
              />
            </label>

            {/* Nama turis */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Nama Turis (pisah dengan koma)</span>
              <input
                type="text"
                value={tourists}
                placeholder="John Doe, Jane Smith"
                onChange={e => setTourists(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
              />
            </label>

            {/* Kebangsaan */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Kebangsaan</span>
              <input
                type="text"
                value={nationality}
                placeholder="Australia, Japan, dsb."
                onChange={e => setNationality(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
              />
            </label>

            {/* Estimasi nominal (manual oleh guide) */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Estimasi Total Tagihan (Rp)
                <span className="ml-1.5 text-white/30">— opsional, bisa diisi saat upload kuitansi</span>
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  placeholder="0"
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </label>

            {/* Catatan */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Catatan Tambahan</span>
              <textarea
                rows={3}
                value={notes}
                placeholder="Info preferensi tamu, permintaan khusus, dll."
                onChange={e => setNotes(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-white/20 resize-none focus:outline-none focus:border-emerald-500/50"
              />
            </label>

            {/* Submit */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl text-muted-foreground"
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={submitting || !date}
              >
                {submitting ? 'Mengirim...' : 'Buat Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function InfoPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground">
      {icon} {children}
    </span>
  )
}

function PackageCard({ pkg, vendorId }: { pkg: PackagePublic; vendorId: string }) {
  const photo = pkg.photo_urls?.[0] ? resolveCoverPhoto(pkg.photo_urls[0]) : ''
  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/30 transition-all duration-200 group">
      <div className="relative h-36 bg-white/5 shrink-0">
        {photo ? (
          <Image src={photo} alt={pkg.package_name} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {pkg.package_name}
          </h3>
          {pkg.package_description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{pkg.package_description}</p>
          )}
        </div>
        {(pkg.duration_hours || pkg.min_pax || pkg.max_pax) && (
          <div className="flex flex-wrap gap-1.5">
            {pkg.duration_hours && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-muted-foreground">
                <Timer size={10} /> {pkg.duration_hours} jam
              </span>
            )}
            {(pkg.min_pax || pkg.max_pax) && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-muted-foreground">
                <Users size={10} /> {pkg.min_pax ?? 1}–{pkg.max_pax ?? '∞'} pax
              </span>
            )}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-end justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Harga</p>
            <p className="text-sm font-bold">
              {formatRupiah(Number(pkg.price_per_pax))}
              <span className="text-[11px] font-normal text-muted-foreground">/pax</span>
            </p>
          </div>
          {pkg.guide_commission_per_pax != null && pkg.guide_commission_per_pax > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground mb-0.5">Komisimu</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <TrendingUp size={11} /> +{formatRupiah(pkg.guide_commission_per_pax)}
              </p>
            </div>
          )}
        </div>
        <Link
          href={`/guide/bookings/new?vendor_id=${vendorId}&package_id=${pkg.id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold transition-all"
        >
          Buat Booking <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}
