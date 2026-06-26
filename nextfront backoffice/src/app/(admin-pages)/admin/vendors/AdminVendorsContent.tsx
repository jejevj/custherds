"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { adminService, AdminVendor } from "@/services/admin.service"
import { Button } from "@/components/ui/button"
import { Store, UserCheck, UserX } from "lucide-react"

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
    } catch {
      alert('Failed to approve vendor.')
    } finally {
      setActing(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectId) return
    setActing(rejectId)
    try {
      await adminService.approveVendor(rejectId, 'reject', rejectNote || undefined)
      setVendors(prev => prev.map(v =>
        v.vendor_id === rejectId ? { ...v, vendor_status: 'rejected' } : v
      ))
    } catch {
      alert('Failed to reject vendor.')
    } finally {
      setActing(null)
      setRejectId(null)
      setRejectNote("")
    }
  }

  const setTab = (val?: string) => {
    const params = new URLSearchParams()
    if (val) params.set('status', val)
    router.push(`/admin/vendors?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
        <p className="text-muted-foreground">Review and approve vendor registrations.</p>
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
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Location</th>
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
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                    {v.vendor_business_name ?? <span className="italic text-muted-foreground">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{v.user_name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{v.user_email}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                  {v.vendor_location ?? '—'}
                </td>
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
                  {v.vendor_status === 'pending' ? (
                    <div className="flex gap-2">
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
                        <UserX className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground capitalize">{v.vendor_status}</span>
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
            <h3 className="font-semibold text-lg">Reject Vendor</h3>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection (optional).
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="e.g. Business documents incomplete or unverifiable"
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
