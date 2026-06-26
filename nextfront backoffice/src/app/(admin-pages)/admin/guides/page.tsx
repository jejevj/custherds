import { Metadata } from "next"
import { Suspense } from "react"
import AdminGuidesContent from "./AdminGuidesContent"

export const metadata: Metadata = {
  title: "Guide Management | Custherds Admin",
}

export default function AdminGuidesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}>
      <AdminGuidesContent />
    </Suspense>
  )
}
