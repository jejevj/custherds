"use client"
import { useEffect, useState } from "react"
import { adminService, AdminUser } from "@/services/admin.service"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AdminVendorsContent() {
  const params = useSearchParams()
  const status = params.get("status") ?? undefined

  const [vendors,  setVendors]  = useState<AdminUser[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  useEffect(() => {
    setLoading(true)
    adminService.listUsers(2)
      .then(d => setVendors(status === "pending" ? d.filter(v => !v.is_active) : d))
      .catch(() => setError("Gagal memuat data vendor."))
      .finally(() => setLoading(false))
  }, [status])

  const approve = async (id: string) => {
    await adminService.approveVendor(id, "approve")
    setVendors(prev => prev.filter(v => v.id !== id))
  }
  const reject = async (id: string) => {
    await adminService.approveVendor(id, "reject")
    setVendors(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {status === "pending" ? "Vendor — Pending Approval" : "All Vendors"}
        </h1>
        <p className="text-muted-foreground">Review dan kelola akun vendor.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {status === "pending" && <th className="px-4 py-3 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada data.</td></tr>
            ) : vendors.map(v => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{v.user_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.user_email}</td>
                <td className="px-4 py-3">
                  <Badge variant={v.is_active ? "default" : "secondary"}>
                    {v.is_active ? "Active" : "Pending"}
                  </Badge>
                </td>
                {status === "pending" && (
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" onClick={() => approve(v.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(v.id)}>Reject</Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
