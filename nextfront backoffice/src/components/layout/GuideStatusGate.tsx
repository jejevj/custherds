"use client"
import { useEffect, useState } from "react"
import { guidesService, GuideProfile, GuideSubmitPayload } from "@/services/guides.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, XCircle, CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react"

type Step = "incomplete" | "pending" | "rejected"

export function GuideStatusGate({ children }: { children: React.ReactNode }) {
  const [profile,  setProfile]  = useState<GuideProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState("")

  // Form state for incomplete onboarding
  const [form, setForm] = useState<GuideSubmitPayload>({
    guide_nationality: "",
    guide_phone: "",
    guide_id_card_url: "",
    guide_certificate: "",
    bio: "",
    languages: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  })

  useEffect(() => {
    guidesService.getProfile()
      .then(p => {
        setProfile(p)
        // Pre-fill form with existing data
        setForm({
          guide_nationality:    p.guide_nationality    ?? "",
          guide_phone:          p.guide_phone          ?? "",
          guide_id_card_url:    p.guide_id_card_url    ?? "",
          guide_certificate:    p.guide_certificate    ?? "",
          bio:                  p.bio                  ?? "",
          languages:            p.languages            ?? "",
          bank_name:            p.bank_name            ?? "",
          bank_account_number:  p.bank_account_number  ?? "",
          bank_account_name:    p.bank_account_name    ?? "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      const updated = await guidesService.submitReview(form)
      setProfile(updated)
      setSaved(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Gagal submit. Pastikan semua field terisi.")
    } finally {
      setSaving(false)
    }
  }

  const handleResubmit = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      const updated = await guidesService.submitReview(form)
      setProfile(updated)
      setSaved(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Gagal submit. Periksa kembali data kamu.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <>{children}</>
  if (!profile || profile.guide_status === "approved") return <>{children}</>

  const status = profile.guide_status as Step

  // ── INCOMPLETE: Onboarding form ────────────────────────────────────────────
  if (status === "incomplete") {
    const requiredFields: (keyof GuideSubmitPayload)[] = [
      "guide_nationality", "guide_phone", "guide_id_card_url",
      "guide_certificate", "bio", "languages",
      "bank_name", "bank_account_number", "bank_account_name",
    ]
    const allFilled = requiredFields.every(f => form[f].trim() !== "")

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
                <h2 className="text-xl font-bold text-gray-900">Lengkapi Data Guide</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sebelum dapat menggunakan platform, lengkapi data dan dokumen berikut untuk dikirim ke admin.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 font-medium mb-1">📋 Dokumen yang diperlukan:</p>
              <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
                <li>KTP / Paspor (URL setelah upload)</li>
                <li>Sertifikat guide resmi (URL setelah upload)</li>
                <li>Rekening bank aktif untuk pencairan komisi</li>
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

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>Kewarganegaraan <span className="text-red-500">*</span></Label>
                  <Input value={form.guide_nationality} onChange={e => setForm(f => ({...f, guide_nationality: e.target.value}))} placeholder="WNI / WNA" />
                </div>
                <div className="grid gap-1">
                  <Label>Nomor HP <span className="text-red-500">*</span></Label>
                  <Input value={form.guide_phone} onChange={e => setForm(f => ({...f, guide_phone: e.target.value}))} placeholder="+62..." />
                </div>
              </div>
              <div className="grid gap-1">
                <Label>URL KTP / Paspor <span className="text-red-500">*</span></Label>
                <Input value={form.guide_id_card_url} onChange={e => setForm(f => ({...f, guide_id_card_url: e.target.value}))} placeholder="https://storage.../ktp.jpg" />
                <p className="text-xs text-muted-foreground">Upload file terlebih dahulu, lalu paste URL-nya di sini</p>
              </div>
              <div className="grid gap-1">
                <Label>URL Sertifikat Guide <span className="text-red-500">*</span></Label>
                <Input value={form.guide_certificate} onChange={e => setForm(f => ({...f, guide_certificate: e.target.value}))} placeholder="https://storage.../sertifikat.pdf" />
              </div>
              <div className="grid gap-1">
                <Label>Bio / Deskripsi Diri <span className="text-red-500">*</span></Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                  placeholder="Ceritakan pengalaman & keahlian kamu sebagai guide"
                />
              </div>
              <div className="grid gap-1">
                <Label>Bahasa yang Dikuasai <span className="text-red-500">*</span></Label>
                <Input value={form.languages} onChange={e => setForm(f => ({...f, languages: e.target.value}))} placeholder="Indonesia, English, dll." />
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Informasi Rekening Bank</p>
                <div className="space-y-2">
                  <div className="grid gap-1">
                    <Label>Nama Bank <span className="text-red-500">*</span></Label>
                    <Input value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} placeholder="BCA / Mandiri / BRI / dst." />
                  </div>
                  <div className="grid gap-1">
                    <Label>Nomor Rekening <span className="text-red-500">*</span></Label>
                    <Input value={form.bank_account_number} onChange={e => setForm(f => ({...f, bank_account_number: e.target.value}))} placeholder="Nomor rekening aktif" />
                  </div>
                  <div className="grid gap-1">
                    <Label>Nama Pemilik Rekening <span className="text-red-500">*</span></Label>
                    <Input value={form.bank_account_name} onChange={e => setForm(f => ({...f, bank_account_name: e.target.value}))} placeholder="Nama sesuai buku tabungan" />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={saving || saved || !allFilled} className="w-full">
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Terkirim — Menunggu Review</>
              ) : !allFilled ? (
                "Lengkapi semua field untuk submit"
              ) : "Kirim untuk Direview Admin"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  // ── PENDING ────────────────────────────────────────────────────────────────
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
              Dokumen dan data kamu sudah diterima dan sedang dalam proses review oleh tim Custherds.
              Kamu akan mendapatkan akses penuh setelah akun diverifikasi.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs text-amber-700 font-medium">📋 Yang sedang diverifikasi:</p>
              <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>KTP / Paspor</li>
                <li>Sertifikat guide resmi</li>
                <li>Data rekening bank</li>
                <li>Bio & kelengkapan profil</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">Proses verifikasi biasanya memakan waktu 1–2 hari kerja.</p>
          </div>
        </div>
      </>
    )
  }

  // ── REJECTED: Re-submit form ───────────────────────────────────────────────
  if (status === "rejected") {
    const requiredFields: (keyof GuideSubmitPayload)[] = [
      "guide_nationality", "guide_phone", "guide_id_card_url",
      "guide_certificate", "bio", "languages",
      "bank_name", "bank_account_number", "bank_account_name",
    ]
    const allFilled = requiredFields.every(f => form[f].trim() !== "")

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
                <h2 className="text-xl font-bold text-gray-900">Akun Ditolak</h2>
                <p className="text-gray-500 text-sm mt-1">Perbaiki data berikut dan kirim ulang untuk direview.</p>
              </div>
            </div>

            {profile.rejection_notes && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">📝 Catatan dari Admin:</p>
                <p className="text-sm text-red-600">{profile.rejection_notes}</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">Berhasil dikirim ulang. Menunggu review admin.</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1"><Label>Kewarganegaraan <span className="text-red-500">*</span></Label><Input value={form.guide_nationality} onChange={e => setForm(f => ({...f, guide_nationality: e.target.value}))} placeholder="WNI / WNA" /></div>
                <div className="grid gap-1"><Label>Nomor HP <span className="text-red-500">*</span></Label><Input value={form.guide_phone} onChange={e => setForm(f => ({...f, guide_phone: e.target.value}))} placeholder="+62..." /></div>
              </div>
              <div className="grid gap-1"><Label>URL KTP / Paspor <span className="text-red-500">*</span></Label><Input value={form.guide_id_card_url} onChange={e => setForm(f => ({...f, guide_id_card_url: e.target.value}))} placeholder="https://..." /></div>
              <div className="grid gap-1"><Label>URL Sertifikat Guide <span className="text-red-500">*</span></Label><Input value={form.guide_certificate} onChange={e => setForm(f => ({...f, guide_certificate: e.target.value}))} placeholder="https://..." /></div>
              <div className="grid gap-1"><Label>Bio <span className="text-red-500">*</span></Label><textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} /></div>
              <div className="grid gap-1"><Label>Bahasa <span className="text-red-500">*</span></Label><Input value={form.languages} onChange={e => setForm(f => ({...f, languages: e.target.value}))} placeholder="Indonesia, English" /></div>
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">Rekening Bank</p>
                <div className="grid gap-1"><Label>Nama Bank <span className="text-red-500">*</span></Label><Input value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} /></div>
                <div className="grid gap-1"><Label>Nomor Rekening <span className="text-red-500">*</span></Label><Input value={form.bank_account_number} onChange={e => setForm(f => ({...f, bank_account_number: e.target.value}))} /></div>
                <div className="grid gap-1"><Label>Atas Nama <span className="text-red-500">*</span></Label><Input value={form.bank_account_name} onChange={e => setForm(f => ({...f, bank_account_name: e.target.value}))} /></div>
              </div>
            </div>

            <Button onClick={handleResubmit} disabled={saving || saved || !allFilled} className="w-full">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim...</> : saved ? <><CheckCircle2 className="h-4 w-4 mr-2" />Terkirim</> : "Kirim Ulang untuk Direview"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
