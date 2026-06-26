"use client"
import { useEffect, useState } from "react"
import { vendorsService, VendorDepositInfo } from "@/services/vendors.service"

export default function VendorDepositPage() {
  const [info,    setInfo]    = useState<VendorDepositInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorsService.getDeposit().then(setInfo).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Deposit Info</h1><p className="text-muted-foreground">Saldo deposit vendor kamu.</p></div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-sm">
        {loading ? <p className="text-muted-foreground">Memuat...</p> : (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Deposit</p>
            <p className="text-4xl font-bold">Rp {Number(info?.deposit_balance ?? 0).toLocaleString("id-ID")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
