"use client"
import { useEffect, useState } from "react"
import { guidesService, GuideProfile } from "@/services/guides.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Props { children: React.ReactNode }

export default function GuideStatusGate({ children }: Props) {
  const [profile, setProfile] = useState<GuideProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<Partial<GuideProfile>>({})

  const set = (k: keyof GuideProfile, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  const isComplete = !!form.bio && !!form.guide_phone && !!form.guide_nationality

  useEffect(() => {
    guidesService.getProfile()
      .then(p => {
        setProfile(p)
        setForm({
          bio: p.bio ?? "",
          guide_phone: p.guide_phone ?? "",
          guide_nationality: p.guide_nationality ?? "",
          languages: p.languages ?? "",
          bank_name: p.bank_name ?? "",
          bank_account_number: p.bank_account_number ?? "",
          bank_account_name: p.bank_account_name ?? "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <>{children}</>
  if (!profile || profile.guide_status === "approved") return <>{children}</>

  const status = profile.guide_status

  const handleSaveAndSubmit = async () => {
    setError("")
    setSaving(true)
    try {
      await guidesService.updateProfile(form)
    } catch {
      setError("Gagal menyimpan data. Coba lagi.")
      setSaving(false)
      return
    }
    setSaving(false)
    setSubmitting(true)
    try {
      const updated = await guidesService.submitReview(form)
      setProfile(updated)
    } catch {
      setError("Gagal mengirim pengajuan. Coba lagi.")
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
                {status === "pending" ? "⏳" : status === "rejected" ? "⚠️" : "📋"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {status === "pending" && "Profil Sedang Diverifikasi"}
                  {status === "rejected" && "Pengajuan Ditolak — Perbarui Data"}
                  {status === "incomplete" && "Lengkapi Profil Guide"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {status === "pending" && "Tim kami sedang mereview dokumen kamu."}
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
                {["Bio / Deskripsi Diri", "Nomor HP", "Kewarganegaraan", "Bahasa", "Nama Bank", "No. Rekening", "Atas Nama Rekening"].map(item => (
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
              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* Profil */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Profil</p>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Bio / Deskripsi Diri <span className="text-destructive">*</span></Label>
                    <textarea
                      rows={3}
                      value={form.bio ?? ""}
                      onChange={e => set("bio", e.target.value)}
                      placeholder="Ceritakan pengalaman & keahlian kamu sebagai guide"
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                      style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.15)", outline: "none" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Nomor HP <span className="text-destructive">*</span></Label>
                      <Input value={form.guide_phone ?? ""} onChange={e => set("guide_phone", e.target.value)} placeholder="+62..." className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Kewarganegaraan <span className="text-destructive">*</span></Label>
                      <Input value={form.guide_nationality ?? ""} onChange={e => set("guide_nationality", e.target.value)} placeholder="WNI / WNA" className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Bahasa yang Dikuasai</Label>
                    <Input value={form.languages ?? ""} onChange={e => set("languages", e.target.value)} placeholder="Indonesia, English, dll." className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                </div>
              </div>

              <Separator style={{ background: "oklch(1 0 0 / 0.10)" }} />

              {/* Bank */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informasi Rekening Bank</p>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Nama Bank</Label>
                    <Input value={form.bank_name ?? ""} onChange={e => set("bank_name", e.target.value)} placeholder="BCA / Mandiri / BRI" className="bg-white/[0.06] border-white/[0.15]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Nomor Rekening</Label>
                      <Input value={form.bank_account_number ?? ""} onChange={e => set("bank_account_number", e.target.value)} placeholder="Nomor rekening aktif" className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Atas Nama</Label>
                      <Input value={form.bank_account_name ?? ""} onChange={e => set("bank_account_name", e.target.value)} placeholder="Nama di buku tabungan" className="bg-white/[0.06] border-white/[0.15]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  onClick={handleSaveAndSubmit}
                  disabled={!isComplete || submitting || saving}
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
