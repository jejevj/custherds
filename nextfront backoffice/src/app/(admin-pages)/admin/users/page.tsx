import { Suspense } from "react"
import AdminUsersContent from "./AdminUsersContent"

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <AdminUsersContent />
    </Suspense>
  )
}
