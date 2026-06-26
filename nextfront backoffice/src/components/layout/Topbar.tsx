'use client'

import { useAuthStore } from '@/store/auth.store'
import { USER_TYPE_LABEL } from '@/lib/constants'
import { Bell, LogOut } from 'lucide-react'

export default function Topbar({ title }: { title?: string }) {
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
      <h1 className="text-white font-semibold text-base">{title ?? 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white leading-none">{user.user_name}</p>
              <p className="text-xs text-slate-400">{USER_TYPE_LABEL[user.user_type] ?? 'Admin'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.user_name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
