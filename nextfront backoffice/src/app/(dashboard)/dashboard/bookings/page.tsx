'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getBookings } from '@/services/bookings.service'
import { formatDate } from '@/lib/utils'
import type { Booking } from '@/types/booking.types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'cancelled', 'completed']

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [filter, setFilter]     = useState('all')

  const load = (status?: string) => {
    setLoading(true)
    getBookings(status === 'all' ? undefined : status)
      .then(setBookings)
      .catch(() => setError('Gagal memuat data booking.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFilter = (val: string) => { setFilter(val); load(val) }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Bookings" />
      <div className="flex-1 p-6 space-y-4">
        <Select value={filter} onValueChange={handleFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'Semua' : s}</SelectItem>)}
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
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Mulai</th>
                    <th className="px-5 py-3 text-left font-medium">Selesai</th>
                    <th className="px-5 py-3 text-left font-medium">Dibuat</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada booking.</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs">{b.booking_code}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3 text-slate-500">{b.start_date ? formatDate(b.start_date) : '-'}</td>
                      <td className="px-5 py-3 text-slate-500">{b.end_date ? formatDate(b.end_date) : '-'}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(b.created_at)}</td>
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/bookings/${b.id}`}>
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
