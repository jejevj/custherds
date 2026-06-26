'use client'

import RouteGuard from '@/components/layout/RouteGuard'
import VendorSidebar from '@/components/layout/VendorSidebar'
import Topbar from '@/components/layout/Topbar'

export default function VendorDashboardPage() {
  return (
    <RouteGuard requiredUserType={2} loginPath="/vendor/login">
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <VendorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar title="Vendor Dashboard" />
          <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Selamat datang, Vendor!</h2>
              <p className="text-slate-400">Kelola produk dan pesanan Anda di sini.</p>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
