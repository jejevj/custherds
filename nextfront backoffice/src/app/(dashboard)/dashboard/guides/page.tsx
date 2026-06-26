'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import StatusBadge from '@/components/shared/StatusBadge'
import { getGuides } from '@/services/guides.service'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Guide } from '@/types/guide.types'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGuides()
      .then(setGuides)
      .catch(() => setError('Gagal memuat data guide.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Guides Management" />
      <div className="flex-1 p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Kebangsaan</th>
                    <th className="px-5 py-3 text-left font-medium">Bahasa</th>
                    <th className="px-5 py-3 text-left font-medium">Sertifikat</th>
                    <th className="px-5 py-3 text-left font-medium">Wallet</th>
                    <th className="px-5 py-3 text-left font-medium">Rating</th>
                    <th className="px-5 py-3 text-left font-medium">Bergabung</th>
                    <th className="px-5 py-3 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guides.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">Belum ada guide.</td></tr>
                  ) : guides.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">{g.guide_nationality ?? '-'}</td>
                      <td className="px-5 py-3">{g.languages ?? '-'}</td>
                      <td className="px-5 py-3"><StatusBadge status={g.guide_certificate_status} /></td>
                      <td className="px-5 py-3 font-medium">{formatRupiah(g.wallet_balance)}</td>
                      <td className="px-5 py-3">{g.rating ?? '-'}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(g.created_at)}</td>
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/guides/${g.id}`}>
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
