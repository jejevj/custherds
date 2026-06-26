"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { adminService, AdminVendor } from "@/services/admin.service"
import { Button } from "@/components/ui/button"
import { Store, UserCheck, UserX, ExternalLink } from "lucide-react"

export function PendingVendorsWidget() {
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState<string | null>(null)

  useEffect(() => {
    adminService.listVendors('pending')
      .then(setVendors)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (vendor: AdminVendor, action: 'approve' | 'reject') => {
    setActing(vendor.vendor_id)
    try {
      await adminService.approveVendor(vendor.vendor_id, action)
      setVendors(prev => prev.filter(v => v.vendor_id !== vendor.vendor_id))
    } catch {
      alert('Action failed. Please try again.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold">Pending Vendor Approvals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">New vendor registrations waiting for review</p>
        </div>
        <Link href="/admin/vendors">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            View All Vendors
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
      ) : vendors.length === 0 ? (
        <div className="text-center py-8">
          <Store className="h-10 w-10 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-700">All caught up!</p>
          <p className="text-xs text-muted-foreground">No pending vendor approvals.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">Business Name</th>
                <th className="pb-2 font-medium">Owner</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Registered</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.vendor_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 font-medium">{v.vendor_business_name ?? '—'}</td>
                  <td className="py-3 text-muted-foreground text-xs">{v.user_name}</td>
                  <td className="py-3 text-xs text-muted-foreground max-w-[160px] truncate">{v.vendor_location ?? '—'}</td>
                  <td className="py-3 text-muted-foreground text-xs">
                    {new Date(v.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button size="sm"
                        className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                        disabled={acting === v.vendor_id}
                        onClick={() => handleAction(v, 'approve')}>
                        <UserCheck className="h-3.5 w-3.5" />
                        {acting === v.vendor_id ? '...' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="outline"
                        className="h-7 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 gap-1"
                        disabled={acting === v.vendor_id}
                        onClick={() => handleAction(v, 'reject')}>
                        <UserX className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
