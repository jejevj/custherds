'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getVendors } from '@/services/vendors.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Vendor } from '@/types/vendor.types'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getVendors()
      .then(setVendors)
      .catch(() => setError('Gagal memuat data vendor.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Vendors Management" />
      <div className="flex-1 p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Nama Bisnis</th>
                    <th className="px-5 py-3 text-left font-medium">Telepon</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Deposit</th>
                    <th className="px-5 py-3 text-left font-medium">Bergabung</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">Belum ada vendor.</td></tr>
                  ) : vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{v.vendor_business_name}</td>
                      <td className="px-5 py-3">{v.vendor_phone ?? '-'}</td>
                      <td className="px-5 py-3"><StatusBadge status={v.vendor_status} /></td>
                      <td className="px-5 py-3">{formatRupiah(v.deposit_balance)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(v.created_at)}</td>
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/vendors/${v.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                            <Eye size={12} /> Detail
                          </Button>
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
