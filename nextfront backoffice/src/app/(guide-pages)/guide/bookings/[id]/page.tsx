import { Suspense } from "react"
import GuideBookingDetailContent from "./GuideBookingDetailContent"

export default function GuideBookingDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Memuat...</div>}>
      <GuideBookingDetailContent />
    </Suspense>
  )
}
