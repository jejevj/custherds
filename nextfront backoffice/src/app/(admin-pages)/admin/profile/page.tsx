"use client"
import { useAuthStore } from "@/store/auth.store"

export default function AdminProfilePage() {
  const user = useAuthStore(s => s.user)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">Informasi akun administrator.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-md space-y-3">
        <div><span className="text-sm text-muted-foreground">Nama</span><p className="font-medium">{user?.user_name ?? "-"}</p></div>
        <div><span className="text-sm text-muted-foreground">Email</span><p className="font-medium">{user?.user_email ?? "-"}</p></div>
        <div><span className="text-sm text-muted-foreground">Role</span><p className="font-medium">Administrator</p></div>
      </div>
    </div>
  )
}
