"use client"
import { useEffect, useState } from "react"
import { vendorsService, VendorProfile } from "@/services/vendors.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, XCircle, CheckCircle2, Loader2 } from "lucide-react"

export function VendorStatusGate({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState("")

  useEffect(() => {
    vendorsService.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleResubmit = async () => {
    if (!profile) return
    setSaving(true); setError(""); setSaved(false)
    try {
      const updated = await vendorsService.updateProfile({
        vendor_name: profile.vendor_name,
        vendor_description: profile.vendor_description,
        vendor_phone: profile.vendor_phone,
        vendor_address: profile.vendor_address,
      })
      setProfile(updated)
      setSaved(true)
    } catch {
      setError("Gagal menyimpan. Silahkan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <>{children}</>
  if (!profile || profile.vendor_status === "approved") return <>{children}</>

  const status = profile.vendor_status // 'pending' | 'rejected'

  // ── PENDING ─────────────────────────────────────────────────────────
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
              Pendaftaran toko kamu sedang dalam proses review oleh tim Custherds.
              Kamu akan mendapatkan akses penuh setelah toko diverifikasi.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs text-amber-700 font-medium">📋 Yang sedang diverifikasi:</p>
              <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>Data toko & dokumen bisnis</li>
                <li>Informasi kontak & alamat</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">Proses verifikasi biasanya memakan waktu 1–2 hari kerja.</p>
          </div>
        </div>
      </>
    )
  }

  // ── REJECTED ────────────────────────────────────────────────────────
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
                <p className="text-gray-500 text-sm mt-1">
                  Pendaftaran toko kamu ditolak. Silahkan perbaiki data berikut dan kirim ulang.
                </p>
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
                <p className="text-sm font-medium">Data berhasil dikirim ulang. Menunggu review admin.</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid gap-1">
                <Label>Nama Toko <span className="text-red-500">*</span></Label>
                <Input
                  value={profile.vendor_name ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_name: e.target.value } : p)}
                  placeholder="Nama toko / usaha"
                />
              </div>
              <div className="grid gap-1">
                <Label>Deskripsi Toko</Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  value={profile.vendor_description ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_description: e.target.value } : p)}
                  placeholder="Ceritakan produk & layanan toko kamu"
                />
              </div>
              <div className="grid gap-1">
                <Label>Nomor HP <span className="text-red-500">*</span></Label>
                <Input
                  value={profile.vendor_phone ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_phone: e.target.value } : p)}
                  placeholder="+62..."
                />
              </div>
              <div className="grid gap-1">
                <Label>Alamat Toko <span className="text-red-500">*</span></Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                  value={profile.vendor_address ?? ""}
                  onChange={e => setProfile(p => p ? { ...p, vendor_address: e.target.value } : p)}
                  placeholder="Alamat lengkap toko / outlet"
                />
              </div>
            </div>

            <Button
              onClick={handleResubmit}
              disabled={saving || saved}
              className="w-full"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Terkirim — Menunggu Review</>
              ) : "Kirim Ulang untuk Direview"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
