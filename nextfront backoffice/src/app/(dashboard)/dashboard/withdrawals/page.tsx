'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getWithdrawals, disburseWithdrawal, overrideWithdrawal } from '@/services/withdrawals.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Withdrawal } from '@/types/withdrawal.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, SendHorizonal, RefreshCw } from 'lucide-react'

const STATUSES = ['all', 'pending', 'processing', 'completed', 'failed']

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [filter, setFilter]           = useState('pending')
  const [disbursing, setDisbursing]   = useState<string | null>(null)
  const [success, setSuccess]         = useState<string | null>(null)

  const load = (status?: string) => {
    setLoading(true); setError(null)
    getWithdrawals(status === 'all' ? undefined : status)
      .then(setWithdrawals)
      .catch(() => setError('Gagal memuat data withdrawal.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [])
  const handleFilter = (val: string) => { setFilter(val); load(val) }

  const handleDisburse = async (w: Withdrawal) => {
    setDisbursing(w.id); setError(null); setSuccess(null)
    try {
      const res = await disburseWithdrawal(w.id)
      setSuccess(`Berhasil disburse ke ${w.bank_account_name}. ID: ${res.xendit_disbursement_id}`)
      load(filter)
    } catch (e: unknown) {
      const err = e as { detail?: string }
      setError(err?.detail || 'Gagal melakukan disbursement.')
    } finally { setDisbursing(null) }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Withdrawals" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Select value={filter} onValueChange={handleFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s === 'all' ? 'Semua' : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => load(filter)}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Nama Rekening</th>
                    <th className="px-5 py-3 text-left font-medium">Bank</th>
                    <th className="px-5 py-3 text-left font-medium">No. Rekening</th>
                    <th className="px-5 py-3 text-left font-medium">Jumlah</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">Tidak ada withdrawal.</td></tr>
                  ) : withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{w.bank_account_name}</td>
                      <td className="px-5 py-3">{w.bank_name}</td>
                      <td className="px-5 py-3 font-mono text-xs">{w.bank_account_number}</td>
                      <td className="px-5 py-3 font-medium text-green-700">{formatRupiah(w.amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={w.status} /></td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(w.created_at)}</td>
                      <td className="px-5 py-3">
                        {w.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="text-xs h-7 gap-1 bg-blue-600 hover:bg-blue-500"
                                disabled={disbursing === w.id}
                              >
                                {disbursing === w.id
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <SendHorizonal size={12} />}
                                Disburse
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Disbursement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Transfer <strong>{formatRupiah(w.amount)}</strong> ke rekening{' '}
                                  <strong>{w.bank_account_name}</strong> ({w.bank_name} {w.bank_account_number}) via Xendit?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDisburse(w)}>Ya, Kirim</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {w.status === 'failed' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-xs h-7">Override Manual</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Override ke Completed?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tandai withdrawal ini sebagai completed secara manual (fallback jika webhook gagal).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() =>
                                  overrideWithdrawal(w.id, { status: 'completed', notes: 'Manual override by admin' })
                                    .then(() => load(filter))
                                    .catch(() => setError('Gagal override.'))
                                }>Ya, Override</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
