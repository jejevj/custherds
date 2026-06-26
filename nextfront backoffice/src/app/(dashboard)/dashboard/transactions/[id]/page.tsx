'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getTransaction } from '@/services/transactions.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/transaction.types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tx, setTx]           = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    getTransaction(id)
      .then(setTx)
      .catch(() => setError('Gagal memuat detail transaksi.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Detail Transaksi" />
      <div className="flex-1 p-6 max-w-3xl">
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" className="mb-4 gap-1"><ArrowLeft size={14} /> Kembali</Button>
        </Link>
        {loading ? <LoadingSpinner /> : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        ) : tx && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Kode Transaksi</p>
                <p className="font-mono font-bold text-slate-800">{tx.transaction_code}</p>
              </div>
              <StatusBadge status={tx.status} className="text-sm px-3 py-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Gross Amount', formatRupiah(tx.gross_amount)],
                ['Vendor Amount', formatRupiah(tx.vendor_amount)],
                ['Komisi Guide', formatRupiah(tx.guide_commission)],
                ['Platform Fee', formatRupiah(tx.platform_fee)],
                ['Split Vendor', `${tx.vendor_percent_snapshot}%`],
                ['Split Guide', `${tx.guide_percent_snapshot}%`],
                ['Split Platform', `${tx.platform_percent_snapshot}%`],
                ['Metode Bayar', tx.payment_method ?? '-'],
                ['Submitted', formatDate(tx.submitted_at)],
                ['Settled', tx.settled_at ? formatDate(tx.settled_at) : '-'],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            {tx.xendit_invoice_url && (
              <a href={tx.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink size={13} /> Lihat Invoice Xendit
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
