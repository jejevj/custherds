'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vendorsBrowseService, VendorDetail, PackagePublic, resolveCoverPhoto } from '@/services/vendors.service'
import { formatRupiah } from '@/services/packages-browse.service'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Clock, Globe, Phone, Zap,
  TrendingUp, Users, Timer, ChevronRight,
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

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded-lg bg-white/5 animate-pulse" />
      <div className="h-52 rounded-2xl bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error || !vendor) return (
    <div className="space-y-4">
      <Link href="/guide/vendors">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft size={14} /> Kembali
        </Button>
      </Link>
      <p className="text-destructive text-sm">{error || 'Vendor tidak ditemukan.'}</p>
    </div>
  )

  const cover = resolveCoverPhoto(vendor.cover_photo)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/guide/vendors">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft size={14} /> Semua Vendor
        </Button>
      </Link>

      {/* Hero card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        {/* Cover */}
        <div className="relative h-48 bg-white/5">
          {cover ? (
            <Image src={cover} alt={vendor.vendor_business_name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-white/10">🏪</div>
          )}
          {vendor.allow_direct_booking && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
              <Zap size={11} /> Direct Booking
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{vendor.vendor_business_name}</h1>
            {vendor.vendor_short_description && (
              <p className="text-sm text-muted-foreground mt-1">{vendor.vendor_short_description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {vendor.vendor_location && (
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {vendor.vendor_location}</span>
            )}
            {vendor.vendor_opening_hours && (
              <span className="flex items-center gap-1.5"><Clock size={13} /> {vendor.vendor_opening_hours}</span>
            )}
            {vendor.vendor_contact_person && (
              <span className="flex items-center gap-1.5"><Phone size={13} /> {vendor.vendor_contact_person}</span>
            )}
            {vendor.vendor_website && (
              <a
                href={vendor.vendor_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:underline"
              >
                <Globe size={13} /> {vendor.vendor_website}
              </a>
            )}
          </div>

          {vendor.vendor_min_spend && (
            <p className="text-xs text-muted-foreground">
              Min. spend: <span className="text-foreground font-medium">{formatRupiah(Number(vendor.vendor_min_spend))}</span>
            </p>
          )}
        </div>
      </div>

      {/* Packages */}
      <div>
        <h2 className="text-base font-semibold mb-3">Paket Tersedia ({vendor.packages.length})</h2>
        {vendor.packages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada paket aktif dari vendor ini.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.packages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} vendorId={vendor.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PackageCard({ pkg, vendorId }: { pkg: PackagePublic; vendorId: string }) {
  const photo = pkg.photo_urls?.[0] ? resolveCoverPhoto(pkg.photo_urls[0]) : ''
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/50 transition-all group">
      {/* Package photo */}
      <div className="relative h-32 bg-white/5">
        {photo ? (
          <Image src={photo} alt={pkg.package_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">📦</div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{pkg.package_name}</h3>
        {pkg.package_description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{pkg.package_description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {pkg.duration_hours && (
            <span className="flex items-center gap-1"><Timer size={11} /> {pkg.duration_hours} jam</span>
          )}
          {(pkg.min_pax || pkg.max_pax) && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {pkg.min_pax ?? 1}–{pkg.max_pax ?? '∞'} pax
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Harga</p>
            <p className="text-sm font-semibold">{formatRupiah(Number(pkg.price_per_pax))}<span className="text-xs font-normal text-muted-foreground">/pax</span></p>
          </div>
          {pkg.guide_commission_per_pax != null && pkg.guide_commission_per_pax > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Komisimu</p>
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                <TrendingUp size={12} /> +{formatRupiah(pkg.guide_commission_per_pax)}
              </p>
            </div>
          )}
        </div>

        {/* CTA — ke halaman buat booking */}
        <Link
          href={`/guide/bookings/new?vendor_id=${vendorId}&package_id=${pkg.id}`}
          className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
        >
          Buat Booking <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
