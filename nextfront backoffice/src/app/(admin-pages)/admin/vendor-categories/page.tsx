import { Suspense } from "react"
import VendorCategoriesContent from "./VendorCategoriesContent"

export default function VendorCategoriesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <VendorCategoriesContent />
    </Suspense>
  )
}
