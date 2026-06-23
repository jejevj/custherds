import { Metadata } from "next"
import {
  Users,
  ShoppingBag,
  Map,
  TrendingUp,
} from "lucide-react"
import { AdminDashboardClient } from "./AdminDashboardClient"

export const metadata: Metadata = {
  title: "Admin Dashboard | Custherds",
}

const stats = [
  { label: "Total Users",        value: "1,240",    change: "+12%", icon: Users },
  { label: "Active Vendors",     value: "84",       change: "+5%",  icon: ShoppingBag },
  { label: "Active Guides",      value: "137",      change: "+8%",  icon: Map },
  { label: "Revenue This Month", value: "Rp 48.2M", change: "+21%", icon: TrendingUp },
]

const recentUsers = [
  { name: "Andi Prasetyo",  role: "Vendor",  status: "Active",  joined: "21 Jun 2026" },
  { name: "Sari Dewi",      role: "Guide",   status: "Pending", joined: "21 Jun 2026" },
  { name: "Budi Santoso",   role: "Tourist", status: "Active",  joined: "20 Jun 2026" },
  { name: "Maya Wulandari", role: "Vendor",  status: "Pending", joined: "20 Jun 2026" },
  { name: "Rizky Fauzan",   role: "Guide",   status: "Active",  joined: "19 Jun 2026" },
]

const recentTransactions = [
  { id: "TRX-001", user: "Andi Prasetyo",  amount: "Rp 250,000", type: "Tour Package", status: "Completed" },
  { id: "TRX-002", user: "Sari Dewi",      amount: "Rp 180,000", type: "Admission",    status: "Pending" },
  { id: "TRX-003", user: "Budi Santoso",   amount: "Rp 500,000", type: "Tour Package", status: "Completed" },
  { id: "TRX-004", user: "Maya Wulandari", amount: "Rp 320,000", type: "Admission",    status: "Failed" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Custherds admin portal. Monitor and manage the entire platform here.
          </p>
        </div>
        {/* Client component handles the modal button */}
        <AdminDashboardClient />
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-sm flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change} this month</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Recent Registrations</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.name} className="border-b last:border-0">
                  <td className="py-2.5">{u.name}</td>
                  <td className="py-2.5">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{u.role}</span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>{u.status}</span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Recent Transactions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2.5 text-muted-foreground font-mono text-xs">{t.id}</td>
                  <td className="py-2.5">{t.user}</td>
                  <td className="py-2.5 font-medium">{t.amount}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : t.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
