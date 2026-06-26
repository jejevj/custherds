"use client"
import { useEffect, useState } from "react"
import { guidesService, GuideWallet } from "@/services/guides.service"

export default function GuideWalletPage() {
  const [wallet,  setWallet]  = useState<GuideWallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    guidesService.getWallet().then(setWallet).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Saldo komisi guide kamu.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-sm">
        {loading ? <p className="text-muted-foreground">Memuat...</p> : (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Tersedia</p>
            <p className="text-4xl font-bold">
              Rp {Number(wallet?.wallet_balance ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
