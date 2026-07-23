"use client"
import { useEffect, useState } from "react"
import { adminService, AdminUser, CreateAdminUserPayload } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShieldCheck, UserPlus } from "lucide-react"
import { useTableSearch } from "@/hooks/useTableSearch"
import { TableSearchInput } from "@/components/ui/TableSearchInput"
import { getTokens } from "@/services/api"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  sub: string
  user_type: number
  is_create_user?: boolean
}

function getCurrentUserId(): string | null {
  try {
    const { access } = getTokens()
    if (!access) return null
    const decoded = jwtDecode<JwtPayload>(access)
    return decoded.sub
  } catch {
    return null
  }
}

export default function AdminUsersContent() {
  const [users,   setUsers]   = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // dialog state
  const [open,        setOpen]        = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [formError,   setFormError]   = useState("")
  const [form, setForm] = useState<CreateAdminUserPayload>({
    user_name:      "",
    user_email:     "",
    user_password:  "",
    is_create_user: false,
  })

  const { query, setQuery, filtered } = useTableSearch(users)

  const fetchUsers = () => {
    setLoading(true)
    adminService.listUsers(99)
      .then(setUsers)
      .catch(() => setError("Failed to load internal users."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
    fetchUsers()
  }, [])

  // Cari data current user dari list
  const currentUserData = users.find(u => u.id === currentUserId)

  /**
   * Aturan: user dengan is_create_user=true HANYA bisa MENGAKTIFKAN (set true)
   * flag is_create_user user lain.
   * TIDAK bisa menonaktifkan (set false) user yang sudah punya is_create_user=true.
   * Switch akan di-disable jika:
   * - target sudah is_create_user=true DAN current user bukan dirinya sendiri
   *   (karena mencabut hak sesama = tidak boleh)
   * - current user sendiri tidak punya is_create_user=true (tidak berhak sama sekali)
   */
  const canTogglePermission = (target: AdminUser): boolean => {
    if (!currentUserData?.is_create_user) return false
    // Kalau target sudah punya is_create_user=true, tidak bisa di-toggle (cabut)
    if (target.is_create_user) return false
    // Kalau target belum punya, bisa di-aktifkan
    return true
  }

  const getPermissionTooltip = (target: AdminUser): string => {
    if (!currentUserData?.is_create_user)
      return "Anda tidak memiliki akses untuk mengubah hak ini"
    if (target.is_create_user)
      return "Tidak dapat mencabut hak dari sesama pemegang izin. Hubungi superadmin."
    return "Aktifkan hak pembuatan user untuk akun ini"
  }

  const toggle = async (user: AdminUser) => {
    await adminService.toggleUser(user.id, !user.is_active)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  const toggleCreatePermission = async (user: AdminUser) => {
    if (!canTogglePermission(user)) return
    try {
      await adminService.updateUserCreatePermission(user.id, !user.is_create_user)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_create_user: !u.is_create_user } : u))
    } catch {
      setError("Gagal mengubah permission. Anda tidak memiliki akses untuk operasi ini.")
    }
  }

  const handleSubmit = async () => {
    setFormError("")
    if (!form.user_name.trim() || !form.user_email.trim() || !form.user_password.trim()) {
      setFormError("Nama, email, dan password wajib diisi.")
      return
    }
    setSubmitting(true)
    try {
      await adminService.createUser(form)
      setOpen(false)
      setForm({ user_name: "", user_email: "", user_password: "", is_create_user: false })
      fetchUsers()
    } catch {
      setFormError("Gagal menambahkan user. Periksa kembali data yang diisi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Users</h1>
          <p className="text-muted-foreground">Manage admin accounts for the Custherds backoffice portal.</p>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TableSearchInput value={query} onChange={setQuery} />
          {query && (
            <p className="text-xs text-muted-foreground">{filtered.length} dari {users.length} hasil</p>
          )}
          {currentUserData?.is_create_user && (
            <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          )}
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
                <th className="px-4 py-3 font-medium">Can Create User</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">
                  {query ? `Tidak ada hasil untuk "${query}"` : "No internal users found."}
                </td></tr>
              ) : filtered.map(u => {
                const canToggle = canTogglePermission(u)
                const tooltip   = getPermissionTooltip(u)
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      {u.user_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.user_email}</td>
                    <td className="px-4 py-3"><Badge variant="outline">Admin</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? "default" : "secondary"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Switch
                              checked={u.is_create_user}
                              onCheckedChange={() => toggleCreatePermission(u)}
                              disabled={!canToggle}
                              aria-label="Toggle create user permission"
                              className={!canToggle ? "opacity-50 cursor-not-allowed" : ""}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => toggle(u)}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Dialog Tambah User */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User Internal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="user_name">Nama</Label>
                <Input
                  id="user_name"
                  placeholder="Masukkan nama lengkap"
                  value={form.user_name}
                  onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="user_email">Email</Label>
                <Input
                  id="user_email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.user_email}
                  onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="user_password">Password</Label>
                <Input
                  id="user_password"
                  type="password"
                  placeholder="Password awal"
                  value={form.user_password}
                  onChange={e => setForm(f => ({ ...f, user_password: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_create_user"
                  checked={form.is_create_user}
                  onCheckedChange={val => setForm(f => ({ ...f, is_create_user: val }))}
                />
                <Label htmlFor="is_create_user" className="cursor-pointer">
                  Boleh membuat user internal lainnya
                </Label>
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
