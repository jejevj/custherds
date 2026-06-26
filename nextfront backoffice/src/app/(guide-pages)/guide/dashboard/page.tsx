import { Metadata } from "next"
import { Suspense } from "react"
import { UnauthorizedToast } from "@/components/unauthorized-toast"

export const metadata: Metadata = {
  title: "Guide Dashboard | Custherds",
}

export default function GuideDashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <UnauthorizedToast />
      </Suspense>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Custherds guide portal. Manage your schedules, tour packages, and tourists here.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Today's Schedule</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Incoming Requests</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Revenue This Month</p>
          <p className="text-3xl font-bold mt-1">Rp 0</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-3xl font-bold mt-1">&mdash;</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Upcoming Schedules</h2>
        <p className="text-sm text-muted-foreground">No tour schedules registered yet.</p>
      </div>
    </div>
  )
}
