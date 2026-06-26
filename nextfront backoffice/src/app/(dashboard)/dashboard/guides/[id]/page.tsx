'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getGuide } from '@/services/guides.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Guide } from '@/types/guide.types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGuide(id)
      .then(setGuide)
      .catch(() => setError('Gagal memuat detail guide.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Detail Guide" />
      <div className="flex-1 p-6 max-w-2xl">
        <Link href="/dashboard/guides">
          <Button variant="ghost" size="sm" className="mb-4 gap-1"><ArrowLeft size={14} /> Kembali</Button>
        </Link>
        {loading ? <LoadingSpinner /> : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        ) : guide && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Kebangsaan', guide.guide_nationality ?? '-'],
                ['Bahasa', guide.languages ?? '-'],
                ['Bio', guide.bio ?? '-'],
                ['Rating', guide.rating ?? '-'],
                ['Status Sertifikat', <StatusBadge key="cert" status={guide.guide_certificate_status} />],
                ['Wallet Balance', formatRupiah(guide.wallet_balance)],
                ['Total Earnings', formatRupiah(guide.total_earnings)],
                ['Pending Earnings', formatRupiah(guide.pending_earnings)],
                ['Bank', guide.bank_name ?? '-'],
                ['No. Rekening', guide.bank_account_number ?? '-'],
                ['Nama Rekening', guide.bank_account_name ?? '-'],
                ['Bergabung', formatDate(guide.created_at)],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
