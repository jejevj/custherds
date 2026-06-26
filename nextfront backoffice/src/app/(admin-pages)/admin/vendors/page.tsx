import { Suspense } from "react"
import AdminVendorsContent from "./AdminVendorsContent"

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <AdminVendorsContent />
    </Suspense>
  )
}
