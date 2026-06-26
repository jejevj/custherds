"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { adminService, AdminGuide } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, UserX } from "lucide-react"

const STATUS_TABS = [
  { label: "All",      value: undefined },
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function AdminGuidesContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const statusFilter = searchParams.get("status") ?? undefined

  const [guides,   setGuides]   = useState<AdminGuide[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")
  const [acting,   setActing]   = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")

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
        g.guide_id === guide.guide_id ? { ...g, guide_certificate_status: 'approved' } : g
      ))
    } catch {
      alert('Failed to approve guide.')
    } finally {
      setActing(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectId) return
    setActing(rejectId)
    try {
      await adminService.approveGuide(rejectId, 'reject', rejectNote || undefined)
      setGuides(prev => prev.map(g =>
        g.guide_id === rejectId ? { ...g, guide_certificate_status: 'rejected' } : g
      ))
    } catch {
      alert('Failed to reject guide.')
    } finally {
      setActing(null)
      setRejectId(null)
      setRejectNote("")
    }
  }

  const setTab = (val?: string) => {
    const params = new URLSearchParams()
    if (val) params.set('status', val)
    router.push(`/admin/guides?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Management</h1>
        <p className="text-muted-foreground">Review and approve Herd Partner registrations.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/60'
            }`}
          >
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
              <th className="px-4 py-3 font-medium">Certificate</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : guides.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No guides found.</td></tr>
            ) : guides.map(g => (
              <tr key={g.guide_id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{g.user_name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{g.user_email}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{g.user_phone ?? '—'}</td>
                <td className="px-4 py-3">{g.guide_nationality ?? <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3">
                  {g.guide_certificate ? (
                    <a href={g.guide_certificate} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-blue-600 underline hover:text-blue-800">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_BADGE[g.guide_certificate_status] ?? 'bg-muted text-muted-foreground'
                  }`}>
                    {g.guide_certificate_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(g.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  {g.guide_certificate_status === 'pending' ? (
                    <div className="flex gap-2">
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
                        <UserX className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground capitalize">{g.guide_certificate_status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject confirmation modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-lg">Reject Guide</h3>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection (optional). This will be stored in the system.
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="e.g. License document is unclear or expired"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setRejectId(null); setRejectNote("") }}>
                Cancel
            </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!!acting}
                onClick={handleRejectConfirm}
              >
                {acting ? 'Processing...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
