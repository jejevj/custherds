"use client"
import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { transactionsService, Transaction, resolveReceiptUrl } from "@/services/transactions.service"
import { Badge } from "@/components/ui/badge"

const QrisPaymentModal = dynamic(
  () => import("@/components/vendor/QrisPaymentModal"),
  { ssr: false }
)

const STATUS_LABEL: Record<string, string> = {
  pending_vendor_approval: "Menunggu Review",
  payment_pending:         "Menunggu Bayar",
  payment_failed:          "Pembayaran Gagal",
  settled:                 "Settled",
  rejected:                "Ditolak",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_vendor_approval: "secondary",
  payment_pending:         "outline",
  payment_failed:          "destructive",
  settled:                 "default",
  rejected:                "destructive",
}

function formatRupiah(n?: number | string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

interface QrisModalState {
  txId: string
  qrisString: string
  amount: number
}

export default function VendorTransactionsPage() {
  const [data,    setData]    = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [qrisModal, setQrisModal] = useState<QrisModalState | null>(null)

  const loadData = useCallback(() => {
    transactionsService.list().then(setData).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function handleShowQris(tx: Transaction) {
    if (!tx.qris_string && !tx.xendit_invoice_url) return
    setQrisModal({
      txId:       tx.id,
      qrisString: tx.qris_string || tx.xendit_invoice_url || "",
      amount:     Number(tx.guide_commission) + Number(tx.platform_fee),
    })
  }

  function handlePaid() {
    setQrisModal(null)
    setLoading(true)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">Riwayat transaksi vendor kamu.</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Gross Total</th>
              <th className="px-4 py-3 font-medium">Bagian Vendor</th>
              <th className="px-4 py-3 font-medium">Tagihan ke Custherds</th>
              <th className="px-4 py-3 font-medium">Bukti</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Belum ada transaksi.</td></tr>
            ) : data.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.transaction_code}</td>
                <td className="px-4 py-3">{formatRupiah(t.gross_amount)}</td>
                <td className="px-4 py-3 font-medium text-blue-400">{formatRupiah(t.vendor_amount)}</td>
                <td className="px-4 py-3 text-orange-400 font-medium">
                  {formatRupiah(Number(t.guide_commission) + Number(t.platform_fee))}
                </td>
                <td className="px-4 py-3">
                  {t.receipt_image ? (
                    <a href={resolveReceiptUrl(t.receipt_image)} target="_blank" rel="noopener noreferrer"
                      className="text-amber-400 hover:underline text-xs">Lihat ↗</a>
                  ) : <span className="text-muted-foreground text-xs">-</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {t.status === "payment_pending" && (t.qris_string || t.xendit_invoice_url) && (
                    <button
                      onClick={() => handleShowQris(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-colors"
                    >
                      <span>📱</span> Bayar QRIS
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrisModal && (
        <QrisPaymentModal
          txId={qrisModal.txId}
          qrisString={qrisModal.qrisString}
          amount={qrisModal.amount}
          onPaid={handlePaid}
          onClose={() => setQrisModal(null)}
        />
      )}
    </div>
  )
}
