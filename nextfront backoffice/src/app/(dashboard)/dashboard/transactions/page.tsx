'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getTransactions } from '@/services/transactions.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/transaction.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

const STATUSES = ['all', 'pending_vendor_approval', 'payment_pending', 'settled', 'rejected']

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [filter, setFilter]             = useState('all')

  const load = (status?: string) => {
    setLoading(true)
    getTransactions(status === 'all' ? undefined : status)
      .then(setTransactions)
      .catch(() => setError('Gagal memuat data transaksi.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  const handleFilter = (val: string) => { setFilter(val); load(val) }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Transactions" />
      <div className="flex-1 p-6 space-y-4">
        <Select value={filter} onValueChange={handleFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'Semua Status' : s.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Kode</th>
                    <th className="px-5 py-3 text-left font-medium">Gross Amount</th>
                    <th className="px-5 py-3 text-left font-medium">Komisi Guide</th>
                    <th className="px-5 py-3 text-left font-medium">Platform Fee</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">Tidak ada transaksi.</td></tr>
                  ) : transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs">{tx.transaction_code}</td>
                      <td className="px-5 py-3 font-medium">{formatRupiah(tx.gross_amount)}</td>
                      <td className="px-5 py-3">{formatRupiah(tx.guide_commission)}</td>
                      <td className="px-5 py-3">{formatRupiah(tx.platform_fee)}</td>
                      <td className="px-5 py-3"><StatusBadge status={tx.status} /></td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(tx.created_at)}</td>
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/transactions/${tx.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Eye size={12} /> Detail</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
