'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, Receipt,
  Wallet, Settings, LogOut, ChevronLeft, ChevronRight,
  Briefcase, UserCheck, Mail, MailOpen, Send, ServerCog,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard',              label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/users',                  label: 'Users',            icon: Users },
  { href: '/admin/guides',                 label: 'Guides',           icon: UserCheck },
  { href: '/admin/vendors',                label: 'Vendors',          icon: Briefcase },
  { href: '/admin/bookings',               label: 'Bookings',         icon: BookOpen },
  { href: '/admin/transactions',           label: 'Transactions',     icon: Receipt },
  { href: '/admin/withdrawals',            label: 'Withdrawals',      icon: Wallet },
  { href: '/admin/payment-gateway-config', label: 'Payment Config',   icon: Settings },
]

const WEBMAIL_ITEMS = [
  { href: '/admin/webmail',                label: 'Inbox',            icon: MailOpen },
  { href: '/admin/webmail/send',           label: 'Kirim Email',      icon: Send },
  { href: '/admin/webmail/config',         label: 'Email Config',     icon: ServerCog },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const logout    = useAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(false)
  const [mailOpen,  setMailOpen]  = useState(() =>
    pathname.startsWith('/admin/webmail'),
  )

  const handleLogout = () => {
    logout()
    router.replace('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href)

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
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {/* Main nav items */}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* Webmail group */}
        <div className="pt-2">
          {/* Group header / toggle */}
          <button
            onClick={() => !collapsed && setMailOpen(o => !o)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors',
              mailOpen && !collapsed
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title={collapsed ? 'Webmail' : undefined}
          >
            <Mail size={18} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Webmail</span>
                <svg
                  className={cn('w-3.5 h-3.5 transition-transform', mailOpen ? 'rotate-180' : '')}
                  fill="none" stroke="currentColor" strokeWidth={2}
                  viewBox="0 0 24 24"
                ><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </>
            )}
          </button>

          {/* Sub items */}
          {(mailOpen || collapsed) && (
            <div className={cn('space-y-0.5', !collapsed && 'pl-3 mt-0.5')}>
              {WEBMAIL_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(href)
                      ? 'bg-blue-600/80 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
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
