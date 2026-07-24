'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminGuidesService, AdminGuideItem } from '@/services/admin.guides.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── helpers ────────────────────────────────────────────────────────────────
function parseErrMsg(err: unknown, fallback = 'Terjadi kesalahan.'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err || fallback
  const e = err as Record<string, unknown>
  if (Array.isArray(e.detail)) {
    const msgs = (e.detail as Array<{ msg?: string; message?: string }>)
      .map(d => d.msg ?? d.message ?? JSON.stringify(d)).filter(Boolean)
    return msgs.length ? msgs.join('; ') : fallback
  }
  if (typeof e.detail === 'string') return e.detail || fallback
  if (typeof e.message === 'string') return e.message || fallback
  return JSON.stringify(err)
}

// settlement_status derived dari ada/tidaknya bank_settlement_id
type SettlementStatus = 'settled' | 'unsettled'

function settlementStatus(guide: AdminGuideItem): SettlementStatus {
  return guide.bank_settlement_id ? 'settled' : 'unsettled'
}

const STATUS_BADGE: Record<SettlementStatus, JSX.Element> = {
  settled:   <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Settled</Badge>,
  unsettled: <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Unsettled</Badge>,
}

// ─── component ──────────────────────────────────────────────────────────────
export default function SettlementBankAccountPage() {
  const [guides, setGuides]         = useState<AdminGuideItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilter]   = useState<SettlementStatus | ''>('')
  const [search, setSearch]         = useState('')
  const [feedback, setFeedback]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // edit modal state
  const [editGuide, setEditGuide]   = useState<AdminGuideItem | null>(null)
  const [editValue, setEditValue]   = useState('')
  const [saving, setSaving]         = useState(false)

  // ─ fetch ────────────────────────────────────────────────────────────────
  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminGuidesService.list()
      setGuides(data)
    } catch (err) {
      setFeedback({ type: 'error', msg: parseErrMsg(err, 'Gagal memuat daftar guide.') })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGuides() }, [fetchGuides])

  // ─ derived list (filter + search) ───────────────────────────────────────
  const displayed = guides.filter(g => {
    if (filterStatus && settlementStatus(g) !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        g.user_name?.toLowerCase().includes(q) ||
        g.user_email?.toLowerCase().includes(q) ||
        (g.bank_name ?? '').toLowerCase().includes(q) ||
        (g.bank_account_number ?? '').includes(q) ||
        (g.bank_settlement_id ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const settledCount   = guides.filter(g => settlementStatus(g) === 'settled').length
  const unsettledCount = guides.filter(g => settlementStatus(g) === 'unsettled').length

  // ─ open edit modal ──────────────────────────────────────────────────────
  const openEdit = (guide: AdminGuideItem) => {
    setEditGuide(guide)
    setEditValue(guide.bank_settlement_id ?? '')
    setFeedback(null)
  }

  // ─ save settlement id ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editGuide) return
    setSaving(true)
    try {
      await adminGuidesService.setBankSettlementId(
        editGuide.guide_id,
        editValue.trim() || null,  // kirim null jika dikosongkan
      )
      setFeedback({ type: 'success', msg: `Settlement ID berhasil diperbarui untuk ${editGuide.user_name}.` })
      setEditGuide(null)
      fetchGuides()
    } catch (err) {
      setFeedback({ type: 'error', msg: parseErrMsg(err, 'Gagal menyimpan Settlement ID.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement Bank Account</h1>
          <p className="text-muted-foreground text-sm">
            Daftar guide beserta rekening bank dan status Settlement ID.
          </p>
        </div>
        <Button variant="outline" onClick={fetchGuides} disabled={loading}>
          {loading ? '⏳ Memuat...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* ── Summary chips ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-lg border px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-muted-foreground">Total Guide</span>
          <span className="font-bold">{guides.length}</span>
        </div>
        <div className="rounded-lg border px-4 py-2 text-sm flex items-center gap-2 bg-emerald-50 border-emerald-200">
          <span className="text-emerald-700">Settled</span>
          <span className="font-bold text-emerald-800">{settledCount}</span>
        </div>
        <div className="rounded-lg border px-4 py-2 text-sm flex items-center gap-2 bg-amber-50 border-amber-200">
          <span className="text-amber-700">Unsettled</span>
          <span className="font-bold text-amber-800">{unsettledCount}</span>
        </div>
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} className="ml-3 underline text-xs">Tutup</button>
        </div>
      )}

      {/* ── Filter + Search ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Status:</Label>
          <select
            value={filterStatus}
            onChange={e => setFilter(e.target.value as SettlementStatus | '')}
            className="border rounded-lg px-3 py-1.5 text-sm bg-background"
          >
            <option value="">Semua</option>
            <option value="settled">Settled</option>
            <option value="unsettled">Unsettled</option>
          </select>
        </div>
        <Input
          placeholder="Cari nama, email, bank, no. rek, settlement ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72 text-sm"
        />
        <span className="text-xs text-muted-foreground">
          Menampilkan {displayed.length} dari {guides.length}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Nama Guide</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 font-medium">No. Rekening</th>
              <th className="px-4 py-3 font-medium">Atas Nama</th>
              <th className="px-4 py-3 font-medium">Settlement ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Memuat data guide…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Tidak ada data yang sesuai filter.</td></tr>
            ) : displayed.map(g => (
              <tr key={g.guide_id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{g.user_name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{g.user_email}</td>
                <td className="px-4 py-3 text-xs">
                  {g.bank_name
                    ? <span>{g.bank_name}</span>
                    : <span className="text-muted-foreground italic">Belum diisi</span>
                  }
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {g.bank_account_number ?? <span className="text-muted-foreground">-</span>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {g.bank_account_name ?? <span className="text-muted-foreground">-</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs max-w-[180px] truncate" title={g.bank_settlement_id ?? undefined}>
                  {g.bank_settlement_id
                    ? <span className="text-emerald-700">{g.bank_settlement_id}</span>
                    : <span className="text-amber-600 italic">Belum diset</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {STATUS_BADGE[settlementStatus(g)]}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(g)}>
                    Set Settlement ID
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal ── */}
      {editGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 mx-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Set Settlement ID</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Guide: <span className="font-medium text-foreground">{editGuide.user_name}</span>
                {' '}·{' '}{editGuide.user_email}
              </p>
            </div>

            {/* Info rekening guide */}
            <div className="rounded-lg bg-muted/40 border px-4 py-3 text-xs space-y-1">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Bank</span>
                <span className="font-medium">{editGuide.bank_name ?? '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">No. Rekening</span>
                <span className="font-mono">{editGuide.bank_account_number ?? '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Atas Nama</span>
                <span>{editGuide.bank_account_name ?? '-'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Settlement ID</Label>
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder="Contoh: SBA-XXXXXXXXXXXXXXXX"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk menghapus / unset settlement ID yang sudah ada.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setEditGuide(null)} disabled={saving}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
