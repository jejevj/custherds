import { Suspense } from "react"
import VendorAreasContent from "./VendorAreasContent"

export default function VendorAreasPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <VendorAreasContent />
    </Suspense>
  )
}
