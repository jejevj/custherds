import { Suspense } from "react"
import AdminReportsContent from "./AdminReportsContent"

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted-foreground text-sm">Memuat laporan...</div>
      }
    >
      <AdminReportsContent />
    </Suspense>
  )
}
