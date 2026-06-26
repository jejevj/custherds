import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import RouteGuard from '@/components/layout/RouteGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredUserType={99} loginPath="/login">
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
