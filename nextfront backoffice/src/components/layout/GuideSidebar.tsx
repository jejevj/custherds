'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, BookOpen, Wallet, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/guide/dashboard',            label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/guide/dashboard/schedule',   label: 'Jadwal',     icon: Calendar },
  { href: '/guide/dashboard/bookings',   label: 'Bookings',   icon: BookOpen },
  { href: '/guide/dashboard/earnings',   label: 'Penghasilan',icon: Wallet },
  { href: '/guide/dashboard/profile',    label: 'Profil',     icon: User },
]

export default function GuideSidebar() {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-lg tracking-tight">Custherds</span>
            <p className="text-emerald-400 text-xs">Guide Portal</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white transition-colors">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/guide/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
              title={collapsed ? label : undefined}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
