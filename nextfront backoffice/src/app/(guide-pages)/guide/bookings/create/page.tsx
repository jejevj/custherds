"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { bookingsService, BookingCreate } from "@/services/bookings.service"
import {
  vendorsBrowseService,
  VendorPublic,
  VendorDetail,
  PackagePublic,
} from "@/services/vendors.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Building2, ChevronRight, ChevronLeft, Search, Package,
  CalendarDays, Users, StickyNote, CheckCircle2, Loader2,
  MapPin, Clock, Tag, Banknote, ArrowRight, Globe, Phone,
  Zap, Star,
} from "lucide-react"

// ── helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(n?: number | string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(num)
}

const CATEGORY_LABEL: Record<number, string> = {
  1: "Restoran", 2: "Hotel", 3: "Atraksi", 4: "Transport", 5: "Lainnya",
}
const AREA_LABEL: Record<number, string> = {
  1: "Bali", 2: "Lombok", 3: "Yogyakarta", 4: "Jakarta", 5: "Surabaya", 6: "Lainnya",
}

// ── step types ────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4

interface FormState {
  vendor_id: string
  booking_type: 'direct' | 'package'
  package_id: string
  booking_date: string
  booking_time: string
  pax_count: number
  tourist_names: string
  tourist_nationality: string
  notes: string
  direct_price: string  // string untuk input, dikonversi saat submit
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Pilih Vendor" },
  { n: 2, label: "Jadwal & Tipe" },
  { n: 3, label: "Detail" },
  { n: 4, label: "Konfirmasi" },
]

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s.n < current ? "bg-emerald-500 text-white" :
              s.n === current ? "bg-amber-500 text-white ring-2 ring-amber-400/40" :
              "bg-muted text-muted-foreground"
            }`}>
              {s.n < current ? <CheckCircle2 size={14} /> : s.n}
            </div>
            <span className={`text-[10px] mt-1 text-center whitespace-nowrap ${
              s.n === current ? "text-amber-400 font-semibold" :
              s.n < current ? "text-emerald-400" : "text-muted-foreground"
            }`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${ s.n < current ? "bg-emerald-500" : "bg-muted" }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Pilih Vendor ──────────────────────────────────────────────────────
function StepVendor({
  onSelect,
}: {
  onSelect: (v: VendorPublic) => void
}) {
  const [vendors, setVendors]   = useState<VendorPublic[]>([])
  const [loading, setLoading]   = useState(true)
  const [search,  setSearch]    = useState("")
  const [filter,  setFilter]    = useState<"all"|"direct"|"package">("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { limit: 50 }
      if (filter === "direct")  params.allow_direct = true
      if (filter === "package") params.allow_direct = false
      if (search.trim())        params.search = search.trim()
      const result = await vendorsBrowseService.browse(params)
      setVendors(result)
    } catch { setVendors([]) }
    finally { setLoading(false) }
  }, [search, filter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Pilih Vendor</h2>
        <p className="text-sm text-muted-foreground">Pilih vendor tempat tourist akan berkunjung.</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
          <Input placeholder="Cari vendor..." className="pl-9 h-9" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        {(["all","direct","package"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
              filter === f
                ? "bg-amber-500 border-amber-500 text-white font-semibold"
                : "border-muted text-muted-foreground hover:border-amber-400 hover:text-amber-400"
            }`}>
            {f === "all" ? "Semua" : f === "direct" ? "Direct Booking" : "Package Only"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : vendors.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada vendor ditemukan.</div>
      ) : (
        <div className="grid gap-3">
          {vendors.map(v => (
            <button key={v.id} onClick={() => onSelect(v)}
              className="text-left w-full rounded-xl border bg-card hover:border-amber-400 hover:bg-amber-500/5 transition-all p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold group-hover:text-amber-400 transition-colors">{v.vendor_business_name}</span>
                    {v.allow_direct_booking && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">
                        <Zap size={9} className="mr-0.5" /> Direct
                      </Badge>
                    )}
                    {v.package_count > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Package size={9} className="mr-0.5" /> {v.package_count} paket
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    {CATEGORY_LABEL[v.vendor_category] && (
                      <span className="flex items-center gap-1"><Tag size={10} />{CATEGORY_LABEL[v.vendor_category]}</span>
                    )}
                    {AREA_LABEL[v.vendor_area] && (
                      <span className="flex items-center gap-1"><MapPin size={10} />{AREA_LABEL[v.vendor_area]}</span>
                    )}
                    {v.vendor_min_spend && (
                      <span className="flex items-center gap-1"><Banknote size={10} />Min. {formatRupiah(v.vendor_min_spend)}</span>
                    )}
                  </div>
                  {v.vendor_short_description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{v.vendor_short_description}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {v.max_commission_per_pax != null && v.max_commission_per_pax > 0 && (
                    <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                      <Star size={9} /> Komisi s/d {formatRupiah(v.max_commission_per_pax)}/pax
                    </span>
                  )}
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-amber-400 mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step 2: Jadwal & Tipe ─────────────────────────────────────────────────────
function StepSchedule({
  vendorId,
  form,
  vendorDetail,
  onLoadDetail,
  onChange,
  onNext,
  onBack,
}: {
  vendorId: string
  form: FormState
  vendorDetail: VendorDetail | null
  onLoadDetail: (d: VendorDetail) => void
  onChange: (k: keyof FormState, v: string | number) => void
  onNext: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(!vendorDetail)
  const [error,   setError]   = useState("")

  useEffect(() => {
    if (vendorDetail) return
    setLoading(true)
    vendorsBrowseService.getDetail(vendorId)
      .then(d => { onLoadDetail(d); setLoading(false) })
      .catch(() => { setError("Gagal memuat detail vendor."); setLoading(false) })
  }, [vendorId, vendorDetail, onLoadDetail])

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin" size={28} /></div>
  if (error || !vendorDetail) return <div className="text-red-400 text-sm">{error || "Vendor tidak ditemukan."}</div>

  const hasPackages = vendorDetail.packages.filter(p => p.is_active).length > 0
  const hasDirect   = vendorDetail.allow_direct_booking

  const selectedPkg = vendorDetail.packages.find(p => p.id === form.package_id) ?? null

  const canProceed = (() => {
    if (!form.booking_date) return false
    if (form.booking_type === "package" && !form.package_id) return false
    if (form.booking_type === "direct" && !form.direct_price) return false
    return true
  })()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Jadwal & Tipe Booking</h2>
        <p className="text-sm text-muted-foreground">Tentukan tanggal, waktu, dan tipe booking ke <strong>{vendorDetail.vendor_business_name}</strong>.</p>
      </div>

      {/* Vendor mini-card */}
      <div className="rounded-xl border bg-card p-4 text-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <p className="font-semibold">{vendorDetail.vendor_business_name}</p>
          {vendorDetail.vendor_location && (
            <p className="text-muted-foreground flex items-center gap-1 mt-0.5 text-xs">
              <MapPin size={10} /> {vendorDetail.vendor_location}
            </p>
          )}
          {vendorDetail.vendor_opening_hours && (
            <p className="text-muted-foreground flex items-center gap-1 mt-0.5 text-xs">
              <Clock size={10} /> {vendorDetail.vendor_opening_hours}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {vendorDetail.vendor_min_spend && (
            <span className="flex items-center gap-1"><Banknote size={10} /> Min. spend: {formatRupiah(vendorDetail.vendor_min_spend)}</span>
          )}
          {vendorDetail.vendor_website && (
            <span className="flex items-center gap-1">
              <Globe size={10} />
              <a href={vendorDetail.vendor_website} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400">
                {vendorDetail.vendor_website}
              </a>
            </span>
          )}
          {vendorDetail.vendor_contact_person && (
            <span className="flex items-center gap-1"><Phone size={10} /> {vendorDetail.vendor_contact_person}</span>
          )}
        </div>
      </div>

      {/* Tanggal & Waktu */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><CalendarDays size={13} /> Tanggal Kunjungan <span className="text-red-500">*</span></Label>
          <Input type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.booking_date}
            onChange={e => onChange("booking_date", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><Clock size={13} /> Waktu Tiba <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
          <Input type="time" value={form.booking_time}
            onChange={e => onChange("booking_time", e.target.value)} />
        </div>
      </div>

      {/* Tipe booking */}
      {!hasPackages && !hasDirect && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          Vendor ini belum memiliki paket aktif dan tidak membuka direct booking.
        </div>
      )}

      {(hasPackages || hasDirect) && (
        <div className="space-y-2">
          <Label>Tipe Booking <span className="text-red-500">*</span></Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {hasDirect && (
              <button
                type="button"
                onClick={() => { onChange("booking_type", "direct"); onChange("package_id", "") }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  form.booking_type === "direct"
                    ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                    : "border-muted hover:border-amber-400"
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-amber-400" />
                  <span className="font-semibold">Direct Booking</span>
                  {form.booking_type === "direct" && <CheckCircle2 size={14} className="text-amber-400 ml-auto" />}
                </div>
                <p className="text-xs text-muted-foreground">Kunjungan bebas tanpa paket khusus. Harga disepakati langsung.</p>
                {vendorDetail.vendor_min_spend && (
                  <p className="text-xs text-amber-300 mt-1">Min. spend: {formatRupiah(vendorDetail.vendor_min_spend)}</p>
                )}
              </button>
            )}
            {hasPackages && (
              <button
                type="button"
                onClick={() => onChange("booking_type", "package")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  form.booking_type === "package"
                    ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40"
                    : "border-muted hover:border-blue-400"
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-blue-400" />
                  <span className="font-semibold">Package</span>
                  {form.booking_type === "package" && <CheckCircle2 size={14} className="text-blue-400 ml-auto" />}
                </div>
                <p className="text-xs text-muted-foreground">Pilih dari paket yang tersedia. Harga dan komisi sudah ditentukan.</p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Direct price input */}
      {form.booking_type === "direct" && (
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5">
            <Banknote size={13} /> Harga per Pax (Direct) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
            <Input
              type="number"
              min="0"
              placeholder={vendorDetail.vendor_min_spend ?? "0"}
              className="pl-9"
              value={form.direct_price}
              onChange={e => onChange("direct_price", e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Harga yang disepakati dengan tourist per orang.
            {vendorDetail.vendor_min_spend
              ? ` Min. spend vendor: ${formatRupiah(vendorDetail.vendor_min_spend)}/pax.`
              : ""}
          </p>
        </div>
      )}

      {/* Package list */}
      {form.booking_type === "package" && (
        <div className="space-y-2">
          <Label>Pilih Paket <span className="text-red-500">*</span></Label>
          <div className="grid gap-2">
            {vendorDetail.packages.filter(p => p.is_active).map((pkg: PackagePublic) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onChange("package_id", pkg.id)}
                className={`rounded-xl border p-4 text-left transition-all w-full ${
                  form.package_id === pkg.id
                    ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40"
                    : "border-muted hover:border-blue-400"
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{pkg.package_name}</span>
                      {form.package_id === pkg.id && <CheckCircle2 size={14} className="text-blue-400" />}
                    </div>
                    {pkg.package_description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pkg.package_description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {pkg.duration_hours && (
                        <span className="flex items-center gap-1"><Clock size={10} /> {pkg.duration_hours}j</span>
                      )}
                      {(pkg.min_pax || pkg.max_pax) && (
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {pkg.min_pax && pkg.max_pax ? `${pkg.min_pax}-${pkg.max_pax} pax` :
                           pkg.min_pax ? `min ${pkg.min_pax} pax` : `max ${pkg.max_pax} pax`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-blue-400 text-sm">{formatRupiah(pkg.price_per_pax)}<span className="text-xs font-normal text-muted-foreground">/pax</span></p>
                    {pkg.guide_commission_per_pax != null && (
                      <p className="text-xs text-emerald-400 mt-0.5">Komisi: {formatRupiah(pkg.guide_commission_per_pax)}/pax</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPkg && form.pax_count > 0 && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-2.5 text-sm flex justify-between items-center mt-1">
              <span className="text-muted-foreground text-xs">Subtotal estimasi ({form.pax_count} pax × {formatRupiah(selectedPkg.price_per_pax)})</span>
              <span className="font-bold text-blue-300">{formatRupiah(Number(selectedPkg.price_per_pax) * form.pax_count)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}><ChevronLeft size={14} className="mr-1" /> Kembali</Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          Lanjut <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ── Step 3: Detail Tourist ────────────────────────────────────────────────────
function StepDetail({
  form,
  onChange,
  onNext,
  onBack,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: string | number) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Detail Kunjungan</h2>
        <p className="text-sm text-muted-foreground">Isi informasi tourist untuk booking ini.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><Users size={13} /> Jumlah Pax <span className="text-red-500">*</span></Label>
          <Input
            type="number" min={1} max={99}
            value={form.pax_count}
            onChange={e => onChange("pax_count", parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-1">
          <Label>Nama Tourist <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
          <Input
            placeholder="Contoh: John Doe, Jane Smith"
            value={form.tourist_names}
            onChange={e => onChange("tourist_names", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Kewarganegaraan <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
          <Input
            placeholder="Contoh: WNA / WNI / Australia"
            value={form.tourist_nationality}
            onChange={e => onChange("tourist_nationality", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><StickyNote size={13} /> Catatan <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
          <textarea
            rows={3}
            placeholder="Permintaan khusus, alergi, preferensi..."
            value={form.notes}
            onChange={e => onChange("notes", e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}><ChevronLeft size={14} className="mr-1" /> Kembali</Button>
        <Button
          onClick={onNext}
          disabled={form.pax_count < 1}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
        >
          Lanjut <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Konfirmasi ────────────────────────────────────────────────────────
function StepConfirm({
  form,
  vendorName,
  vendorDetail,
  loading,
  error,
  onSubmit,
  onBack,
}: {
  form: FormState
  vendorName: string
  vendorDetail: VendorDetail | null
  loading: boolean
  error: string
  onSubmit: () => void
  onBack: () => void
}) {
  const selectedPkg = vendorDetail?.packages.find(p => p.id === form.package_id) ?? null
  const directPriceNum = parseFloat(form.direct_price) || 0

  const subtotal = form.booking_type === "package" && selectedPkg
    ? Number(selectedPkg.price_per_pax) * form.pax_count
    : form.booking_type === "direct" && directPriceNum > 0
    ? directPriceNum * form.pax_count
    : null

  const komisiBadge = form.booking_type === "package" && selectedPkg?.guide_commission_per_pax
    ? formatRupiah(selectedPkg.guide_commission_per_pax * form.pax_count)
    : null

  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Vendor", value: vendorName },
    { label: "Tipe", value: form.booking_type === "direct" ? "Direct Booking" : "Package" },
    ...(selectedPkg ? [{ label: "Paket", value: selectedPkg.package_name }] : []),
    { label: "Tanggal", value: new Date(form.booking_date).toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" }) },
    ...(form.booking_time ? [{ label: "Waktu", value: form.booking_time }] : []),
    { label: "Jumlah Pax", value: `${form.pax_count} orang` },
    ...(form.tourist_nationality ? [{ label: "Kewarganegaraan", value: form.tourist_nationality }] : []),
    ...(form.tourist_names ? [{ label: "Nama Tourist", value: form.tourist_names }] : []),
    ...(subtotal != null ? [{ label: "Estimasi Total", value: formatRupiah(subtotal), highlight: true }] : []),
    ...(komisiBadge ? [{ label: "Estimasi Komisi", value: komisiBadge, highlight: true }] : []),
    ...(form.notes ? [{ label: "Catatan", value: form.notes }] : []),
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Konfirmasi Booking</h2>
        <p className="text-sm text-muted-foreground">Periksa kembali detail sebelum mengirim ke vendor.</p>
      </div>

      <div className="rounded-xl border bg-card divide-y text-sm">
        {rows.map(row => (
          <div key={row.label} className="flex justify-between items-start px-4 py-2.5 gap-4">
            <span className="text-muted-foreground shrink-0">{row.label}</span>
            <span className={`text-right ${ row.highlight ? "font-bold text-amber-400" : "" }`}>{row.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={loading}><ChevronLeft size={14} className="mr-1" /> Kembali</Button>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          {loading ? (
            <><Loader2 size={14} className="mr-2 animate-spin" /> Mengirim...</>
          ) : (
            <><ArrowRight size={14} className="mr-1" /> Kirim ke Vendor</>
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  const [form, setForm] = useState<FormState>({
    vendor_id: "",
    booking_type: "direct",
    package_id: "",
    booking_date: "",
    booking_time: "",
    pax_count: 1,
    tourist_names: "",
    tourist_nationality: "",
    notes: "",
    direct_price: "",
  })

  const [selectedVendor, setSelectedVendor]   = useState<VendorPublic | null>(null)
  const [vendorDetail,   setVendorDetail]     = useState<VendorDetail | null>(null)
  const [loading,        setLoading]          = useState(false)
  const [error,          setError]            = useState("")

  const set = useCallback((k: keyof FormState, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v })), [])

  const handleSelectVendor = (v: VendorPublic) => {
    setSelectedVendor(v)
    setVendorDetail(null)  // reset detail so step 2 refetches
    set("vendor_id", v.id)
    // default tipe: prefer direct jika vendor mengizinkan
    set("booking_type", v.allow_direct_booking ? "direct" : "package")
    set("package_id", "")
    set("direct_price", "")
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const payload: BookingCreate = {
        vendor_id:           form.vendor_id,
        booking_type:        form.booking_type,
        booking_date:        form.booking_date,
        pax_count:           form.pax_count,
        ...(form.booking_time       ? { booking_time: form.booking_time }           : {}),
        ...(form.package_id         ? { package_id: form.package_id }               : {}),
        ...(form.tourist_names      ? { tourist_names: form.tourist_names }          : {}),
        ...(form.tourist_nationality? { tourist_nationality: form.tourist_nationality } : {}),
        ...(form.notes              ? { notes: form.notes }                          : {}),
        ...(form.booking_type === "direct" && form.direct_price
          ? { direct_price: parseFloat(form.direct_price) } : {}),
      }
      await bookingsService.create(payload)
      router.push("/guide/bookings")
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || "Gagal membuat booking. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Booking Baru</h1>
        <p className="text-muted-foreground text-sm">Ikuti langkah berikut untuk membuat booking tourist ke vendor.</p>
      </div>

      <StepBar current={step} />

      {step === 1 && (
        <StepVendor onSelect={handleSelectVendor} />
      )}

      {step === 2 && selectedVendor && (
        <StepSchedule
          vendorId={selectedVendor.id}
          form={form}
          vendorDetail={vendorDetail}
          onLoadDetail={setVendorDetail}
          onChange={set}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepDetail
          form={form}
          onChange={set}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && selectedVendor && (
        <StepConfirm
          form={form}
          vendorName={selectedVendor.vendor_business_name}
          vendorDetail={vendorDetail}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
