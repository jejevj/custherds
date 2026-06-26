'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, Receipt,
  Wallet, Settings, LogOut, ChevronLeft, ChevronRight,
  Briefcase, UserCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',            label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/dashboard/users',      label: 'Users',          icon: Users },
  { href: '/dashboard/guides',     label: 'Guides',         icon: UserCheck },
  { href: '/dashboard/vendors',    label: 'Vendors',        icon: Briefcase },
  { href: '/dashboard/bookings',   label: 'Bookings',       icon: BookOpen },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/withdrawals', label: 'Withdrawals',   icon: Wallet },
  { href: '/dashboard/split-config', label: 'Split Config', icon: Settings },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const logout    = useAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight">Custherds</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-slate-800 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
