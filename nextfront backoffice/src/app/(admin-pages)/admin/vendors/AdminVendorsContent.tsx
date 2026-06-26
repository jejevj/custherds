"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { adminService, AdminVendor } from "@/services/admin.service"
import { Button } from "@/components/ui/button"
import { UserCheck, UserX, Eye, X, FileText } from "lucide-react"
import { uploadsService } from "@/services/uploads.service"
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

async function fetchProtectedFile(relUrl: string): Promise<string | null> {
  if (!relUrl) return null
  try {
    const { access } = getTokens()
    const url = uploadsService.getUrl(relUrl)
    const res = await fetch(url, { headers: access ? { Authorization: `Bearer ${access}` } : {} })
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

function VendorDetailModal({ vendor, onClose }: { vendor: AdminVendor; onClose: () => void }) {
  const [idCardSrc,   setIdCardSrc]   = useState<string | null>(null)
  const [loadingId,   setLoadingId]   = useState(false)

  useEffect(() => {
    if (vendor.vendor_owner_id_card_url) {
      setLoadingId(true)
      fetchProtectedFile(vendor.vendor_owner_id_card_url).then(src => { setIdCardSrc(src); setLoadingId(false) })
    }
    return () => { if (idCardSrc) URL.revokeObjectURL(idCardSrc) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor.vendor_id])

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url)
  const isPdf   = (url: string) => /\.pdf$/i.test(url)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-xl my-auto border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <div>
            <h3 className="font-semibold text-base">{vendor.vendor_business_name ?? vendor.user_name}</h3>
            <p className="text-xs text-muted-foreground">{vendor.user_email}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex gap-3 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
              STATUS_BADGE[vendor.vendor_status] ?? 'bg-muted text-muted-foreground'
            }`}>
              Status: {vendor.vendor_status}
            </span>
          </div>

          {/* Rejection notes */}
          {vendor.approval_notes && vendor.vendor_status === 'rejected' && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm">
              <p className="font-semibold text-red-700 mb-0.5">Catatan Penolakan</p>
              <p className="text-red-600">{vendor.approval_notes}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {([
              ["Nama Toko",         vendor.vendor_business_name],
              ["Contact Person",    vendor.vendor_contact_person ?? vendor.user_name],
              ["Telepon",           vendor.user_phone],
              ["Kategori",          vendor.vendor_category != null ? String(vendor.vendor_category) : null],
              ["Area",              vendor.vendor_area != null ? String(vendor.vendor_area) : null],
              ["Jam Operasional",   vendor.vendor_opening_hours],
              ["NPWP",              vendor.vendor_npwp],
              ["NIB",               vendor.vendor_nib],
              ["Min. Spend",        vendor.vendor_min_spend ? `Rp ${Number(vendor.vendor_min_spend).toLocaleString('id-ID')}` : null],
              ["Cashback",          vendor.vendor_cashback_percent != null ? `${vendor.vendor_cashback_percent}%` : null],
              ["Terdaftar",         new Date(vendor.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })],
            ] as [string, string | null | undefined][]).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-medium">{v ?? '\u2014'}</p>
              </div>
            ))}
          </div>

          {vendor.vendor_location && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Alamat / Lokasi</p>
              <p className="text-sm leading-relaxed">{vendor.vendor_location}</p>
            </div>
          )}

          {vendor.vendor_short_description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Deskripsi Singkat</p>
              <p className="text-sm leading-relaxed">{vendor.vendor_short_description}</p>
            </div>
          )}

          {vendor.vendor_website && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Website</p>
              <a href={vendor.vendor_website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 underline break-all">
                {vendor.vendor_website}
              </a>
            </div>
          )}

          {vendor.vendor_know_from && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Mengetahui dari</p>
              <p className="text-sm">{vendor.vendor_know_from}</p>
            </div>
          )}

          {/* KTP Pemilik */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">KTP Pemilik</p>
            {!vendor.vendor_owner_id_card_url ? (
              <p className="text-sm text-muted-foreground italic">Tidak diupload</p>
            ) : loadingId ? (
              <div className="h-40 rounded-lg bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">Memuat...</div>
            ) : idCardSrc && isImage(vendor.vendor_owner_id_card_url) ? (
              <a href={idCardSrc} target="_blank" rel="noopener noreferrer">
                <img src={idCardSrc} alt="KTP Pemilik" className="rounded-lg border max-h-52 w-full object-contain bg-muted cursor-zoom-in" />
              </a>
            ) : idCardSrc && isPdf(vendor.vendor_owner_id_card_url) ? (
              <a href={idCardSrc} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 underline">
                <FileText className="h-4 w-4" /> Buka PDF
              </a>
            ) : (
              <p className="text-xs text-red-500">Gagal memuat file</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminVendorsContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const statusFilter = searchParams.get("status") ?? undefined

  const [vendors,    setVendors]    = useState<AdminVendor[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [acting,     setActing]     = useState<string | null>(null)
  const [rejectId,   setRejectId]   = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [detail,     setDetail]     = useState<AdminVendor | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    adminService.listVendors(statusFilter)
      .then(setVendors)
      .catch(() => setError("Failed to load vendors."))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const handleApprove = async (vendor: AdminVendor) => {
    setActing(vendor.vendor_id)
    try {
      await adminService.approveVendor(vendor.vendor_id, 'approve')
      setVendors(prev => prev.map(v =>
        v.vendor_id === vendor.vendor_id ? { ...v, vendor_status: 'approved' } : v
      ))
    } catch { alert('Failed to approve vendor.') }
    finally { setActing(null) }
  }

  const handleRejectConfirm = async () => {
    if (!rejectId) return
    setActing(rejectId)
    try {
      await adminService.approveVendor(rejectId, 'reject', rejectNote || undefined)
      setVendors(prev => prev.map(v =>
        v.vendor_id === rejectId
          ? { ...v, vendor_status: 'rejected', approval_notes: rejectNote } : v
      ))
    } catch { alert('Failed to reject vendor.') }
    finally { setActing(null); setRejectId(null); setRejectNote("") }
  }

  const setTab = (val?: string) => {
    const p = new URLSearchParams()
    if (val) p.set('status', val)
    router.push(`/admin/vendors?${p.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
        <p className="text-muted-foreground">Review and approve vendor registrations.</p>
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
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No vendors found.</td></tr>
            ) : vendors.map(v => (
              <tr key={v.vendor_id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{v.vendor_business_name ?? '\u2014'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{v.user_email}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{v.user_phone ?? '\u2014'}</td>
                <td className="px-4 py-3">{v.vendor_category ?? <span className="text-muted-foreground">\u2014</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_BADGE[v.vendor_status] ?? 'bg-muted text-muted-foreground'
                  }`}>
                    {v.vendor_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(v.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1"
                      onClick={() => setDetail(v)}>
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Button>
                    {v.vendor_status === 'pending' && (
                      <>
                        <Button size="sm"
                          className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          disabled={acting === v.vendor_id}
                          onClick={() => handleApprove(v)}>
                          <UserCheck className="h-3.5 w-3.5" />
                          {acting === v.vendor_id ? '...' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="outline"
                          className="h-7 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 gap-1"
                          disabled={acting === v.vendor_id}
                          onClick={() => { setRejectId(v.vendor_id); setRejectNote("") }}>
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

      {detail && <VendorDetailModal vendor={detail} onClose={() => setDetail(null)} />}

      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border">
            <h3 className="font-semibold text-lg">Reject Vendor</h3>
            <p className="text-sm text-muted-foreground">Berikan alasan penolakan (opsional). Akan ditampilkan ke vendor.</p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3} placeholder="Contoh: Dokumen NIB tidak valid"
              value={rejectNote} onChange={e => setRejectNote(e.target.value)}
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
