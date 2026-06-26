'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getVendor, approveVendor } from '@/services/vendors.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Vendor } from '@/types/vendor.types'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = () => {
    setLoading(true)
    getVendor(id)
      .then(setVendor)
      .catch(() => setError('Gagal memuat detail vendor.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleAction = async (action: 'approve' | 'reject') => {
    setActing(true)
    try {
      await approveVendor(id, action)
      load()
    } catch { setError('Gagal mengubah status vendor.') }
    finally { setActing(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Detail Vendor" />
      <div className="flex-1 p-6 max-w-2xl">
        <Link href="/dashboard/vendors">
          <Button variant="ghost" size="sm" className="mb-4 gap-1"><ArrowLeft size={14} /> Kembali</Button>
        </Link>
        {loading ? <LoadingSpinner /> : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        ) : vendor && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Nama Bisnis', vendor.vendor_business_name],
                  ['Alamat', vendor.vendor_address ?? '-'],
                  ['Telepon', vendor.vendor_phone ?? '-'],
                  ['Status', <StatusBadge key="status" status={vendor.vendor_status} />],
                  ['Deposit Balance', formatRupiah(vendor.deposit_balance)],
                  ['Bergabung', formatDate(vendor.created_at)],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {vendor.vendor_status === 'review' && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="gap-1 bg-green-600 hover:bg-green-500" disabled={acting}>
                      <CheckCircle size={14} /> Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve vendor ini?</AlertDialogTitle>
                      <AlertDialogDescription>{vendor.vendor_business_name} akan diaktifkan sebagai vendor.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAction('approve')}>Ya, Approve</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-1" disabled={acting}>
                      <XCircle size={14} /> Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject vendor ini?</AlertDialogTitle>
                      <AlertDialogDescription>Vendor {vendor.vendor_business_name} akan ditolak.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-500" onClick={() => handleAction('reject')}>Ya, Reject</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
