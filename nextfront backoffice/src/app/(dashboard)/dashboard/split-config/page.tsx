'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { getSplitConfigs, createSplitConfig, type SplitConfig } from '@/services/admin.service'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Loader2 } from 'lucide-react'

export default function SplitConfigPage() {
  const [configs, setConfigs]   = useState<SplitConfig[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({ vendor_percent: '', guide_percent: '', platform_percent: '', notes: '' })

  const totalPercent =
    Number(form.vendor_percent || 0) +
    Number(form.guide_percent  || 0) +
    Number(form.platform_percent || 0)

  const load = () => {
    setLoading(true)
    getSplitConfigs()
      .then(setConfigs)
      .catch(() => setError('Gagal memuat split config.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (totalPercent !== 100) { setError('Total persentase harus 100%.'); return }
    setCreating(true); setError(null)
    try {
      await createSplitConfig({
        vendor_percent:   Number(form.vendor_percent),
        guide_percent:    Number(form.guide_percent),
        platform_percent: Number(form.platform_percent),
        notes:            form.notes || undefined,
      })
      setSuccess('Split config baru berhasil dibuat.')
      setForm({ vendor_percent: '', guide_percent: '', platform_percent: '', notes: '' })
      load()
    } catch (e: unknown) {
      const err = e as { detail?: string }
      setError(err?.detail || 'Gagal membuat split config.')
    } finally { setCreating(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Split Revenue Config" />
      <div className="flex-1 p-6 space-y-6 max-w-4xl">
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

        {/* Form buat baru */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={16} /> Buat Split Config Baru
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {['vendor_percent', 'guide_percent', 'platform_percent'].map((field) => (
              <div key={field} className="space-y-1">
                <Label className="text-xs text-slate-600 capitalize">
                  {field.replace('_percent', '')} (%)
                </Label>
                <Input
                  type="number" min={0} max={100}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="space-y-1 mb-4">
            <Label className="text-xs text-slate-600">Notes (opsional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Keterangan config ini..."
            />
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${ totalPercent === 100 ? 'text-green-600' : 'text-red-500' }`}>
              Total: {totalPercent}% {totalPercent !== 100 && '(harus 100%)'}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={creating || totalPercent !== 100} className="gap-1">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Simpan Config
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Simpan split config baru?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vendor {form.vendor_percent}% | Guide {form.guide_percent}% | Platform {form.platform_percent}%
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreate}>Ya, Simpan</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* List configs */}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Vendor %</th>
                    <th className="px-5 py-3 text-left font-medium">Guide %</th>
                    <th className="px-5 py-3 text-left font-medium">Platform %</th>
                    <th className="px-5 py-3 text-left font-medium">Aktif</th>
                    <th className="px-5 py-3 text-left font-medium">Berlaku Sejak</th>
                    <th className="px-5 py-3 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {configs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">Belum ada config.</td></tr>
                  ) : configs.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{c.vendor_percent}%</td>
                      <td className="px-5 py-3 font-medium">{c.guide_percent}%</td>
                      <td className="px-5 py-3 font-medium">{c.platform_percent}%</td>
                      <td className="px-5 py-3">
                        <Badge className={c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                          {c.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(c.effective_from)}</td>
                      <td className="px-5 py-3 text-slate-500">{c.notes ?? '-'}</td>
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
