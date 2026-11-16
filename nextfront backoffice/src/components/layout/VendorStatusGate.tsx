"use client"
import { useEffect, useState } from "react"
import { vendorsService, VendorProfile } from "@/services/vendors.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadsService } from "@/services/uploads.service"
import { buildVendorReviewPayload, requiredVendorFields, validateOwnerIdentity, vendorReviewError } from "@/lib/vendor-review"
import { Separator } from "@/components/ui/separator"

interface Props { children: React.ReactNode }

export default function VendorStatusGate({ children }: Props) {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<Partial<VendorProfile>>({})

  const set = (k: keyof VendorProfile, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  const isComplete = (Object.keys(requiredVendorFields) as (keyof typeof requiredVendorFields)[])
    .every(key => !!form[key]?.trim())

  useEffect(() => {
    vendorsService.getProfile()
      .then(p => {
        setProfile(p)
        setForm({
          vendor_business_name: p.vendor_business_name ?? "",
          vendor_short_description: p.vendor_short_description ?? "",
          vendor_contact_person: p.vendor_contact_person ?? "",
          vendor_location: p.vendor_location ?? "",
          vendor_website: p.vendor_website ?? "",
          vendor_opening_hours: p.vendor_opening_hours ?? "",
          vendor_npwp: p.vendor_npwp ?? "",
          vendor_nib: p.vendor_nib ?? "",
          vendor_owner_id_card_url: p.vendor_owner_id_card_url ?? "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <>{children}</>
  if (!profile || profile.vendor_status === "approved") return <>{children}</>

  const status = profile.vendor_status

  const handleIdentityUpload = async (file?: File) => {
    if (!file || uploading || saving || submitting) return
    setError("")
    setUploading(true)
    try {
      validateOwnerIdentity(file)
      const result = await uploadsService.upload(file)
      set("vendor_owner_id_card_url", result.url)
    } catch (err) {
      setError(vendorReviewError(err, "Gagal mengunggah identitas pemilik. Coba lagi."))
    } finally {
      setUploading(false)
    }
  }

  const handleSaveAndSubmit = async () => {
    if (uploading || saving || submitting) return
    setError("")
    let payload: ReturnType<typeof buildVendorReviewPayload>
    try {
      payload = buildVendorReviewPayload(form)
    } catch (err) {
      setError(vendorReviewError(err, "Lengkapi semua field wajib."))
      return
    }
    setSaving(true)
    try {
      await vendorsService.updateProfile({
        ...payload,
        vendor_website: form.vendor_website?.trim() || null,
        vendor_opening_hours: form.vendor_opening_hours?.trim() || null,
      })
    } catch (err) {
      setError(vendorReviewError(err, "Gagal menyimpan data. Coba lagi."))
      setSaving(false)
      return
    }
    setSaving(false)
    setSubmitting(true)
    try {
      const updated = await vendorsService.submitReview(payload)
      setProfile(updated)
    } catch (err) {
      setError(vendorReviewError(err, "Gagal mengirim pengajuan. Coba lagi."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          background: "oklch(0 0 0 / 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div
          className="relative w-full max-w-2xl my-auto rounded-2xl border shadow-2xl"
          style={{
            background: "linear-gradient(160deg, oklch(1 0 0 / 0.07), oklch(1 0 0 / 0.03))",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderColor: "oklch(1 0 0 / 0.15)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.15)" }}
              >
                {status === "pending" ? "⏳" : status === "rejected" ? "⚠️" : "🏪"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {status === "pending" && "Toko Sedang Diverifikasi"}
                  {status === "rejected" && "Pengajuan Ditolak — Perbarui Data"}
                  {status === "incomplete" && "Lengkapi Profil Toko"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {status === "pending" && "Tim kami sedang mereview data toko kamu."}
                  {status === "rejected" && "Perbaiki data berdasarkan catatan admin, lalu kirim ulang."}
                  {status === "incomplete" && "Isi semua data di bawah sebelum mengajukan verifikasi."}
                </p>
              </div>
            </div>
            {status === "rejected" && profile.rejection_notes && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-sm"
                style={{ background: "oklch(0.577 0.245 27 / 0.15)", border: "1px solid oklch(0.577 0.245 27 / 0.35)" }}
              >
                <p className="font-semibold text-destructive mb-0.5">Catatan dari Admin</p>
                <p className="text-foreground/80">{profile.rejection_notes}</p>
              </div>
            )}
          </div>

          {/* Pending state */}
          {status === "pending" ? (
            <div className="px-8 py-8">
              <div className="space-y-2">
                {["Nama Toko", "Deskripsi Toko", "Contact Person", "Lokasi / Alamat", "Jam Operasional", "NPWP", "NIB", "Identitas Pemilik"].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ background: "oklch(1 0 0 / 0.15)" }}
                    >✓</div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Kamu akan mendapat notifikasi saat verifikasi selesai.</p>
            </div>
          ) : (
            /* incomplete / rejected — form */
            <div className="px-8 py-6 space-y-5">
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              {/* Info Toko */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informasi Toko</p>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Nama Toko <span className="text-destructive">*</span></Label>
                    <Input value={form.vendor_business_name ?? ""} onChange={e => set("vendor_business_name", e.target.value)} placeholder="Nama toko / usaha" className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Deskripsi Singkat <span className="text-destructive">*</span></Label>
                    <textarea
                      rows={3}
                      value={form.vendor_short_description ?? ""}
                      onChange={e => set("vendor_short_description", e.target.value)}
                      placeholder="Ceritakan produk & layanan bisnis kamu"
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                      style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.15)", outline: "none" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Contact Person <span className="text-destructive">*</span></Label>
                      <Input value={form.vendor_contact_person ?? ""} onChange={e => set("vendor_contact_person", e.target.value)} placeholder="Nama PIC" className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Jam Operasional</Label>
                      <Input value={form.vendor_opening_hours ?? ""} onChange={e => set("vendor_opening_hours", e.target.value)} placeholder="Senin-Jumat 09-17" className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Alamat / Lokasi <span className="text-destructive">*</span></Label>
                    <textarea
                      rows={2}
                      value={form.vendor_location ?? ""}
                      onChange={e => set("vendor_location", e.target.value)}
                      placeholder="Alamat lengkap toko / outlet"
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                      style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.15)", outline: "none" }}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Website</Label>
                    <Input value={form.vendor_website ?? ""} onChange={e => set("vendor_website", e.target.value)} placeholder="https://" className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                </div>
              </div>

              <Separator style={{ background: "oklch(1 0 0 / 0.10)" }} />

              {/* Legalitas */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Legalitas Usaha</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-sm">NPWP <span className="text-destructive">*</span></Label>
                    <Input value={form.vendor_npwp ?? ""} onChange={e => set("vendor_npwp", e.target.value)} placeholder="Nomor NPWP" className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">NIB <span className="text-destructive">*</span></Label>
                    <Input value={form.vendor_nib ?? ""} onChange={e => set("vendor_nib", e.target.value)} placeholder="Nomor Induk Berusaha" className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vendor-owner-identity" className="text-sm">
                  Identitas Pemilik (KTP / Paspor) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vendor-owner-identity"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={uploading || saving || submitting}
                  aria-describedby="vendor-owner-identity-help"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    e.target.value = ""
                    void handleIdentityUpload(file)
                  }}
                  className="bg-white/[0.06] border-white/[0.15]"
                />
                <p id="vendor-owner-identity-help" className="text-xs text-muted-foreground">
                  Wajib unggah identitas pemilik yang jelas dan terbaca. JPG, PNG, WEBP, atau PDF; maksimal 5 MB.
                </p>
                <p aria-live="polite" className="text-xs text-muted-foreground">
                  {uploading ? "Mengunggah identitas pemilik…" : form.vendor_owner_id_card_url ? "Identitas pemilik sudah diunggah. Pilih file lain untuk menggantinya." : "Belum ada identitas pemilik yang diunggah."}
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  onClick={handleSaveAndSubmit}
                  disabled={!isComplete || submitting || saving || uploading}
                  className="w-full h-11 font-semibold"
                >
                  {saving ? "Menyimpan data…" : submitting ? "Mengirim pengajuan…" : "Simpan & Kirim untuk Direview"}
                </Button>
                {!isComplete && (
                  <p className="text-center text-xs text-muted-foreground mt-2">Lengkapi semua field bertanda * untuk melanjutkan</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
