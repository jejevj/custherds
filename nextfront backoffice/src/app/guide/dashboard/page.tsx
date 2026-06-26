'use client'

import RouteGuard from '@/components/layout/RouteGuard'
import GuideSidebar from '@/components/layout/GuideSidebar'
import Topbar from '@/components/layout/Topbar'

export default function GuideDashboardPage() {
  return (
    <RouteGuard requiredUserType={1} loginPath="/guide/login">
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <GuideSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar title="Guide Dashboard" />
          <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Selamat datang, Guide!</h2>
              <p className="text-slate-400">Kelola jadwal dan booking Anda di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
