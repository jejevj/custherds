'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { getUsers } from '@/services/users.service'
import { getTransactions } from '@/services/transactions.service'
import { getWithdrawals } from '@/services/withdrawals.service'
import { formatRupiah } from '@/lib/utils'
import { Users, Receipt, Wallet, TrendingUp, Loader2 } from 'lucide-react'
import type { Transaction } from '@/types/transaction.types'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

interface SummaryCard {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [totalUsers, setTotalUsers]               = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalRevenue, setTotalRevenue]           = useState(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
  const [recentTx, setRecentTx] = useState<Transaction[]>([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [users, transactions, withdrawals] = await Promise.all([
          getUsers(),
          getTransactions(),
          getWithdrawals('pending'),
        ])
        setTotalUsers(users.length)
        setTotalTransactions(transactions.length)
        const rev = transactions
          .filter((t) => t.status === 'settled')
          .reduce((sum, t) => sum + parseFloat(t.platform_fee ?? '0'), 0)
        setTotalRevenue(rev)
        setPendingWithdrawals(withdrawals.length)
        setRecentTx(transactions.slice(0, 8))
      } catch {
        setError('Gagal memuat data dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const cards: SummaryCard[] = [
    { label: 'Total Users',            value: totalUsers,        icon: Users,     color: 'bg-blue-500' },
    { label: 'Total Transaksi',        value: totalTransactions, icon: Receipt,   color: 'bg-purple-500' },
    { label: 'Revenue Platform',       value: formatRupiah(totalRevenue), icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Pending Withdrawals',    value: pendingWithdrawals, icon: Wallet,   color: 'bg-orange-500' },
  ]

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                  <div className={`${c.color} rounded-lg p-3 text-white`}>
                    <c.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{c.label}</p>
                    <p className="text-xl font-bold text-slate-800">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Transaksi Terbaru</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs">
                      <th className="px-5 py-3 text-left font-medium">Kode</th>
                      <th className="px-5 py-3 text-left font-medium">Gross Amount</th>
                      <th className="px-5 py-3 text-left font-medium">Komisi Guide</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTx.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada transaksi</td></tr>
                    ) : recentTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">{tx.transaction_code}</td>
                        <td className="px-5 py-3 font-medium">{formatRupiah(tx.gross_amount)}</td>
                        <td className="px-5 py-3">{formatRupiah(tx.guide_commission)}</td>
                        <td className="px-5 py-3"><StatusBadge status={tx.status} /></td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
