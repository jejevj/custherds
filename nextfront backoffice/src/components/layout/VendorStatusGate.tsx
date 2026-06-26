"use client"
import { useEffect, useState } from "react"
import { vendorsService, VendorProfile, VendorSubmitPayload } from "@/services/vendors.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, XCircle, CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react"

type Step = "incomplete" | "pending" | "rejected"

export function VendorStatusGate({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState("")

  const [form, setForm] = useState<VendorSubmitPayload>({
    vendor_business_name:     "",
    vendor_location:          "",
    vendor_contact_person:    "",
    vendor_npwp:              "",
    vendor_nib:               "",
    vendor_owner_id_card_url: "",
    vendor_short_description: "",
  })

  useEffect(() => {
    vendorsService.getProfile()
      .then(p => {
        setProfile(p)
        setForm({
          vendor_business_name:     p.vendor_business_name     ?? "",
          vendor_location:          p.vendor_location          ?? "",
          vendor_contact_person:    p.vendor_contact_person    ?? "",
          vendor_npwp:              p.vendor_npwp              ?? "",
          vendor_nib:               p.vendor_nib               ?? "",
          vendor_owner_id_card_url: p.vendor_owner_id_card_url ?? "",
          vendor_short_description: p.vendor_short_description ?? "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const doSubmit = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      const updated = await vendorsService.submitReview(form)
      setProfile(updated)
      setSaved(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Gagal submit. Pastikan semua field terisi.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <>{children}</>
  if (!profile || profile.vendor_status === "approved") return <>{children}</>

  const status = profile.vendor_status as Step
  const requiredFields: (keyof VendorSubmitPayload)[] = [
    "vendor_business_name", "vendor_location", "vendor_contact_person",
    "vendor_npwp", "vendor_nib", "vendor_owner_id_card_url", "vendor_short_description",
  ]
  const allFilled = requiredFields.every(f => form[f].trim() !== "")

  const onboardingForm = (
    <div className="space-y-3">
      <div className="grid gap-1">
        <Label>Nama Bisnis <span className="text-red-500">*</span></Label>
        <Input value={form.vendor_business_name} onChange={e => setForm(f => ({...f, vendor_business_name: e.target.value}))} placeholder="Nama toko / usaha" />
      </div>
      <div className="grid gap-1">
        <Label>Deskripsi Singkat <span className="text-red-500">*</span></Label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={3}
          value={form.vendor_short_description}
          onChange={e => setForm(f => ({...f, vendor_short_description: e.target.value}))}
          placeholder="Ceritakan produk & layanan bisnis kamu"
        />
      </div>
      <div className="grid gap-1">
        <Label>Alamat / Lokasi <span className="text-red-500">*</span></Label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={2}
          value={form.vendor_location}
          onChange={e => setForm(f => ({...f, vendor_location: e.target.value}))}
          placeholder="Alamat lengkap toko / outlet"
        />
      </div>
      <div className="grid gap-1">
        <Label>Nama Contact Person <span className="text-red-500">*</span></Label>
        <Input value={form.vendor_contact_person} onChange={e => setForm(f => ({...f, vendor_contact_person: e.target.value}))} placeholder="Nama PIC yang bisa dihubungi" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">Dokumen Legalitas</p>
        <div className="space-y-2">
          <div className="grid gap-1">
            <Label>NPWP <span className="text-red-500">*</span></Label>
            <Input value={form.vendor_npwp} onChange={e => setForm(f => ({...f, vendor_npwp: e.target.value}))} placeholder="XX.XXX.XXX.X-XXX.XXX" />
          </div>
          <div className="grid gap-1">
            <Label>NIB (Nomor Induk Berusaha) <span className="text-red-500">*</span></Label>
            <Input value={form.vendor_nib} onChange={e => setForm(f => ({...f, vendor_nib: e.target.value}))} placeholder="Nomor NIB dari OSS" />
          </div>
          <div className="grid gap-1">
            <Label>URL KTP Pemilik <span className="text-red-500">*</span></Label>
            <Input value={form.vendor_owner_id_card_url} onChange={e => setForm(f => ({...f, vendor_owner_id_card_url: e.target.value}))} placeholder="https://storage.../ktp-pemilik.jpg" />
            <p className="text-xs text-muted-foreground">Upload file terlebih dahulu, lalu paste URL-nya di sini</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── INCOMPLETE ──────────────────────────────────────────────────────────────
  if (status === "incomplete") {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 shrink-0">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lengkapi Data Toko</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sebelum dapat menggunakan platform, lengkapi data dan dokumen legalitas bisnis kamu.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 font-medium">📋 Dokumen yang diperlukan:</p>
              <ul className="text-xs text-blue-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>NPWP bisnis</li>
                <li>NIB (Nomor Induk Berusaha) dari OSS</li>
                <li>KTP pemilik / penanggung jawab (URL setelah upload)</li>
              </ul>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">Berhasil dikirim! Menunggu review admin.</p>
              </div>
            )}

            {onboardingForm}

            <Button onClick={doSubmit} disabled={saving || saved || !allFilled} className="w-full">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim...</> :
               saved  ? <><CheckCircle2 className="h-4 w-4 mr-2" />Terkirim — Menunggu Review</> :
               !allFilled ? "Lengkapi semua field untuk submit" :
               "Kirim untuk Direview Admin"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  // ── PENDING ─────────────────────────────────────────────────────────────────
  if (status === "pending") {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-amber-100 rounded-full p-4">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Menunggu Verifikasi</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Data dan dokumen bisnis kamu sudah diterima dan sedang dalam proses review oleh tim Custherds.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs text-amber-700 font-medium">📋 Yang sedang diverifikasi:</p>
              <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>NPWP & NIB bisnis</li>
                <li>KTP pemilik</li>
                <li>Data & deskripsi toko</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">Proses verifikasi biasanya memakan waktu 1–2 hari kerja.</p>
          </div>
        </div>
      </>
    )
  }

  // ── REJECTED ─────────────────────────────────────────────────────────────────
  if (status === "rejected") {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3 shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pendaftaran Ditolak</h2>
                <p className="text-gray-500 text-sm mt-1">Perbaiki data berikut dan kirim ulang untuk direview.</p>
              </div>
            </div>

            {profile.approval_notes && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">📝 Catatan dari Admin:</p>
                <p className="text-sm text-red-600">{profile.approval_notes}</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">Berhasil dikirim ulang. Menunggu review admin.</p>
              </div>
            )}

            {onboardingForm}

            <Button onClick={doSubmit} disabled={saving || saved || !allFilled} className="w-full">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim...</> :
               saved  ? <><CheckCircle2 className="h-4 w-4 mr-2" />Terkirim</> :
               "Kirim Ulang untuk Direview"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
