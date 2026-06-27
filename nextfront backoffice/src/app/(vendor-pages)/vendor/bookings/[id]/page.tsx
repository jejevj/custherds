import { Suspense } from "react"
import BookingDetailContent from "./BookingDetailContent"

export default function BookingDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Memuat...</div>}>
      <BookingDetailContent />
    </Suspense>
  )
}
