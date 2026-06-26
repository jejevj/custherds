'use client'

import { useAuthStore } from '@/store/auth.store'
import { USER_TYPE_LABEL } from '@/lib/constants'
import { Bell } from 'lucide-react'

export default function Topbar({ title }: { title?: string }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      <h1 className="text-slate-800 font-semibold text-base">{title ?? 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-700">
          <Bell size={18} />
        </button>
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.user_name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-none">{user.user_name}</p>
              <p className="text-xs text-slate-500">{USER_TYPE_LABEL[user.user_type] ?? 'Admin'}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
