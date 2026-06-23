"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"
import { SimulatePaymentModal } from "@/components/SimulatePaymentModal"

export function AdminDashboardClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shrink-0"
      >
        <CreditCard className="h-4 w-4" />
        Simulate Payment
      </button>

      <SimulatePaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
