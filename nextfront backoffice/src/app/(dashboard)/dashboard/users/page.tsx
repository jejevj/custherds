'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { getUsers, toggleUserActive } from '@/services/users.service'
import { USER_TYPE_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers]       = useState<User[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [filter, setFilter]     = useState<string>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  const load = async (type?: number) => {
    setLoading(true); setError(null)
    try { setUsers(await getUsers(type)) }
    catch { setError('Gagal memuat data users.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleFilter = (val: string) => {
    setFilter(val)
    load(val === 'all' ? undefined : Number(val))
  }

  const handleToggle = async (user: User) => {
    setToggling(user.id)
    try {
      await toggleUserActive(user.id, !user.is_active)
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    } catch { setError('Gagal mengubah status user.') }
    finally { setToggling(null) }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Users Management" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Select value={filter} onValueChange={handleFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Filter type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="1">Guide</SelectItem>
              <SelectItem value="2">Vendor</SelectItem>
              <SelectItem value="99">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => load(filter === 'all' ? undefined : Number(filter))}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Nama</th>
                    <th className="px-5 py-3 text-left font-medium">Email</th>
                    <th className="px-5 py-3 text-left font-medium">Tipe</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Bergabung</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada user.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{u.user_name}</td>
                      <td className="px-5 py-3 text-slate-600">{u.user_email}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline">{USER_TYPE_LABEL[u.user_type] ?? u.user_type}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={u.is_active ? 'destructive' : 'default'}
                              disabled={toggling === u.id}
                              className="text-xs h-7"
                            >
                              {toggling === u.id ? '...' : u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {u.is_active ? 'Nonaktifkan' : 'Aktifkan'} user ini?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {u.user_name} ({u.user_email}) akan di-{u.is_active ? 'nonaktifkan' : 'aktifkan'}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggle(u)}>Ya, lanjutkan</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
