'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vendorsBrowseService, VendorDetail, PackagePublic, resolveCoverPhoto } from '@/services/vendors.service'
import { formatRupiah } from '@/services/packages-browse.service'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Clock, Globe, Phone, Zap,
  TrendingUp, Users, Timer, ChevronRight, Package,
} from 'lucide-react'

export default function GuideVendorDetailContent({ vendorId }: { vendorId: string }) {
  const [vendor,  setVendor]  = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setLoading(true)
    vendorsBrowseService
      .getDetail(vendorId)
      .then(setVendor)
      .catch(() => setError('Gagal memuat detail vendor.'))
      .finally(() => setLoading(false))
  }, [vendorId])

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-8">
      <div className="h-8 w-36 rounded-xl bg-white/5 animate-pulse" />
      <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 animate-pulse">
        <div className="h-56" />
        <div className="p-6 space-y-3">
          <div className="h-6 w-48 rounded-lg bg-white/10" />
          <div className="h-4 w-72 rounded-lg bg-white/5" />
          <div className="flex gap-3 pt-1">
            {[80,100,60].map(w => <div key={w} className={`h-7 w-${w} rounded-full bg-white/5`} />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1,2,3].map(i => <div key={i} className="h-56 rounded-3xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  )

  // ── Error ─────────────────────────────────────────────────────────────────
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

  const cover = resolveCoverPhoto(vendor.cover_photo)

  return (
    <div className="space-y-8 pb-10">

      {/* ── Back ────────────────────────────────────────────────────────── */}
      <Link href="/guide/vendors">
        <Button variant="ghost" size="sm" className="gap-2 -ml-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Semua Vendor
        </Button>
      </Link>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">

        {/* Cover photo */}
        <div className="relative h-52 sm:h-64 bg-white/5">
          {cover ? (
            <Image
              src={cover}
              alt={vendor.vendor_business_name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-10">🏪</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on cover */}
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

        {/* Info body */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* Deskripsi */}
          {vendor.vendor_short_description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vendor.vendor_short_description}
            </p>
          )}

          {/* Info pills */}
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

          {/* Min spend */}
          {vendor.vendor_min_spend && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-white/5 pt-4">
              <span>Min. spend:</span>
              <span className="font-semibold text-foreground">{formatRupiah(Number(vendor.vendor_min_spend))}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Packages ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendor.packages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} vendorId={vendor.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Info Pill helper ─────────────────────────────────────────────────────────
function InfoPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground">
      {icon} {children}
    </span>
  )
}

// ── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, vendorId }: { pkg: PackagePublic; vendorId: string }) {
  const photo = pkg.photo_urls?.[0] ? resolveCoverPhoto(pkg.photo_urls[0]) : ''

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/30 transition-all duration-200 group">

      {/* Photo */}
      <div className="relative h-36 bg-white/5 shrink-0">
        {photo ? (
          <Image
            src={photo}
            alt={pkg.package_name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + desc */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {pkg.package_name}
          </h3>
          {pkg.package_description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {pkg.package_description}
            </p>
          )}
        </div>

        {/* Meta chips */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + commission */}
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
                <TrendingUp size={11} />
                +{formatRupiah(pkg.guide_commission_per_pax)}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
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
