import { Suspense } from "react"
import VendorBookingsContent from "./VendorBookingsContent"

export default function VendorBookingsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <VendorBookingsContent />
    </Suspense>
  )
}
