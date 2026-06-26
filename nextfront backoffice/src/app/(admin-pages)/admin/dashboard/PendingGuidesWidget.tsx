"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { adminService, AdminGuide } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, UserX, ExternalLink } from "lucide-react"

export function PendingGuidesWidget() {
  const [guides,  setGuides]  = useState<AdminGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    adminService.listGuides('pending')
      .then(setGuides)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAction = async (guide: AdminGuide, action: 'approve' | 'reject') => {
    setActing(guide.guide_id)
    try {
      await adminService.approveGuide(guide.guide_id, action)
      setGuides(prev => prev.filter(g => g.guide_id !== guide.guide_id))
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
          <h2 className="font-semibold">Pending Guide Approvals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            New guide registrations waiting for review
          </p>
        </div>
        <Link href="/admin/guides">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            View All Guides
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
      ) : guides.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className="h-10 w-10 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-700">All caught up!</p>
          <p className="text-xs text-muted-foreground">No pending guide approvals.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Nationality</th>
                <th className="pb-2 font-medium">Registered</th>
                <th className="pb-2 font-medium">Certificate</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((g) => (
                <tr key={g.guide_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 font-medium">{g.user_name}</td>
                  <td className="py-3 text-muted-foreground text-xs">{g.user_email}</td>
                  <td className="py-3">{g.guide_nationality ?? <span className="text-muted-foreground italic">—</span>}</td>
                  <td className="py-3 text-muted-foreground text-xs">
                    {new Date(g.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    {g.guide_certificate ? (
                      <a
                        href={g.guide_certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        View file
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not uploaded</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                        disabled={acting === g.guide_id}
                        onClick={() => handleAction(g, 'approve')}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {acting === g.guide_id ? '...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 gap-1"
                        disabled={acting === g.guide_id}
                        onClick={() => handleAction(g, 'reject')}
                      >
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
