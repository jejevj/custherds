"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { adminService, AdminGuide } from "@/services/admin.service"
import { Button } from "@/components/ui/button"
import { UserCheck, UserX, Eye, X, FileText } from "lucide-react"
import { API_BASE_URL } from "@/lib/constants"
import { getTokens } from "@/services/api"

const STATUS_TABS = [
  { label: "All",       value: undefined },
  { label: "Pending",   value: "pending" },
  { label: "Approved",  value: "approved" },
  { label: "Rejected",  value: "rejected" },
] as const

const STATUS_BADGE: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  approved:   "bg-green-100 text-green-700",
  rejected:   "bg-red-100 text-red-700",
  incomplete: "bg-gray-100 text-gray-500",
}

// Fetch a protected file and return an object URL
async function fetchProtectedFile(relUrl: string): Promise<string | null> {
  if (!relUrl) return null
  try {
    const { access } = getTokens()
    const url = relUrl.startsWith('http') ? relUrl : `${API_BASE_URL}${relUrl}`
    const res = await fetch(url, { headers: access ? { Authorization: `Bearer ${access}` } : {} })
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

function GuideDetailModal({ guide, onClose }: { guide: AdminGuide; onClose: () => void }) {
  const [idCardSrc, setIdCardSrc]   = useState<string | null>(null)
  const [certSrc,   setCertSrc]     = useState<string | null>(null)
  const [loadingId, setLoadingId]   = useState(false)
  const [loadingCert, setLoadingCert] = useState(false)

  useEffect(() => {
    if (guide.guide_id_card_url) {
      setLoadingId(true)
      fetchProtectedFile(guide.guide_id_card_url).then(src => { setIdCardSrc(src); setLoadingId(false) })
    }
    if (guide.guide_certificate) {
      setLoadingCert(true)
      fetchProtectedFile(guide.guide_certificate).then(src => { setCertSrc(src); setLoadingCert(false) })
    }
    return () => {
      if (idCardSrc) URL.revokeObjectURL(idCardSrc)
      if (certSrc)   URL.revokeObjectURL(certSrc)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide.guide_id])

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url)
  const isPdf   = (url: string) => /\.pdf$/i.test(url)

  const renderDoc = (label: string, origUrl: string | null | undefined, blobSrc: string | null, loading: boolean) => {
    if (!origUrl) return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground italic">Tidak diupload</p>
      </div>
    )
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
        {loading ? (
          <div className="h-40 rounded-lg bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">Memuat...</div>
        ) : blobSrc && isImage(origUrl) ? (
          <a href={blobSrc} target="_blank" rel="noopener noreferrer">
            <img src={blobSrc} alt={label} className="rounded-lg border max-h-52 w-full object-contain bg-muted cursor-zoom-in" />
          </a>
        ) : blobSrc && isPdf(origUrl) ? (
          <a href={blobSrc} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 underline">
            <FileText className="h-4 w-4" /> Buka PDF
          </a>
        ) : (
          <p className="text-xs text-red-500">Gagal memuat file</p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-xl my-auto border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <div>
            <h3 className="font-semibold text-base">{guide.user_name}</h3>
            <p className="text-xs text-muted-foreground">{guide.user_email}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex gap-3 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_BADGE[guide.guide_status] ?? 'bg-muted text-muted-foreground'}`}>
              Status: {guide.guide_status}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_BADGE[guide.guide_certificate_status] ?? 'bg-muted text-muted-foreground'}`}>
              Sertifikat: {guide.guide_certificate_status}
            </span>
          </div>

          {/* Rejection notes */}
          {guide.rejection_notes && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm">
              <p className="font-semibold text-red-700 mb-0.5">Catatan Penolakan</p>
              <p className="text-red-600">{guide.rejection_notes}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {([
              ["Telepon",          guide.guide_phone],
              ["Kewarganegaraan",  guide.guide_nationality],
              ["Bahasa",           guide.languages],
              ["Terdaftar",        new Date(guide.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })],
            ] as [string, string | null | undefined][]).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-medium">{v ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          {guide.bio && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Bio</p>
              <p className="text-sm leading-relaxed">{guide.bio}</p>
            </div>
          )}

          {/* Documents */}
          <div className="grid grid-cols-1 gap-4">
            {renderDoc("KTP / Paspor",     guide.guide_id_card_url, idCardSrc, loadingId)}
            {renderDoc("Sertifikat Guide", guide.guide_certificate,  certSrc,   loadingCert)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminGuidesContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const statusFilter = searchParams.get("status") ?? undefined

  const [guides,     setGuides]     = useState<AdminGuide[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [acting,     setActing]     = useState<string | null>(null)
  const [rejectId,   setRejectId]   = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [detail,     setDetail]     = useState<AdminGuide | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    adminService.listGuides(statusFilter)
      .then(setGuides)
      .catch(() => setError("Failed to load guides."))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const handleApprove = async (guide: AdminGuide) => {
    setActing(guide.guide_id)
    try {
      await adminService.approveGuide(guide.guide_id, 'approve')
      setGuides(prev => prev.map(g =>
        g.guide_id === guide.guide_id
          ? { ...g, guide_status: 'approved', guide_certificate_status: 'approved' } : g
      ))
    } catch { alert('Failed to approve guide.') }
    finally { setActing(null) }
  }

  const handleRejectConfirm = async () => {
    if (!rejectId) return
    setActing(rejectId)
    try {
      await adminService.approveGuide(rejectId, 'reject', rejectNote || undefined)
      setGuides(prev => prev.map(g =>
        g.guide_id === rejectId
          ? { ...g, guide_status: 'rejected', guide_certificate_status: 'rejected', rejection_notes: rejectNote } : g
      ))
    } catch { alert('Failed to reject guide.') }
    finally { setActing(null); setRejectId(null); setRejectNote("") }
  }

  const setTab = (val?: string) => {
    const p = new URLSearchParams()
    if (val) p.set('status', val)
    router.push(`/admin/guides?${p.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Management</h1>
        <p className="text-muted-foreground">Review and approve Herd Partner registrations.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button key={tab.label} onClick={() => setTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/60'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Nationality</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : guides.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No guides found.</td></tr>
            ) : guides.map(g => (
              <tr key={g.guide_id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{g.user_name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{g.user_email}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{g.user_phone ?? '—'}</td>
                <td className="px-4 py-3">{g.guide_nationality ?? <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_BADGE[g.guide_status] ?? 'bg-muted text-muted-foreground'
                  }`}>
                    {g.guide_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(g.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <Button size="sm" variant="outline"
                      className="h-7 px-2.5 text-xs gap-1"
                      onClick={() => setDetail(g)}>
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Button>
                    {g.guide_status === 'pending' && (
                      <>
                        <Button size="sm"
                          className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          disabled={acting === g.guide_id}
                          onClick={() => handleApprove(g)}>
                          <UserCheck className="h-3.5 w-3.5" />
                          {acting === g.guide_id ? '...' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="outline"
                          className="h-7 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 gap-1"
                          disabled={acting === g.guide_id}
                          onClick={() => { setRejectId(g.guide_id); setRejectNote("") }}>
                          <UserX className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {detail && <GuideDetailModal guide={detail} onClose={() => setDetail(null)} />}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border">
            <h3 className="font-semibold text-lg">Reject Guide</h3>
            <p className="text-sm text-muted-foreground">Berikan alasan penolakan (opsional). Akan ditampilkan ke guide.</p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="Contoh: Dokumen KTP buram atau tidak valid"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setRejectId(null); setRejectNote("") }}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!!acting} onClick={handleRejectConfirm}>
                {acting ? 'Processing...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
