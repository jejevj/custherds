"use client"
import { useEffect, useState } from "react"
import { adminService, AdminUser } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export default function AdminUsersContent() {
  const [users,   setUsers]   = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    setLoading(true)
    // Only fetch internal admins (user_type=99)
    adminService.listUsers(99)
      .then(setUsers)
      .catch(() => setError("Failed to load internal users."))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (user: AdminUser) => {
    await adminService.toggleUser(user.id, !user.is_active)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Internal Users</h1>
        <p className="text-muted-foreground">Manage admin accounts for the Custherds backoffice portal.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No internal users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  {u.user_name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.user_email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">Admin</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.is_active ? "default" : "secondary"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => toggle(u)}>
                    {u.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
