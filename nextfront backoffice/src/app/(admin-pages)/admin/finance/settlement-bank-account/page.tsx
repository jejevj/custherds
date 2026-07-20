'use client'

import { useEffect, useState, useCallback } from 'react'
import { settlementBankAccountService } from '@/services/settlementBankAccount.service'
import type {
  SettlementBankAccount,
  SettlementBankAccountCreate,
  SettlementBankAccountUpdate,
  SBAStatus,
} from '@/types/settlementBankAccount.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Error normalizer ─────────────────────────────────────────────────
/**
 * Selalu kembalikan string dari error apapun:
 * - string               → langsung
 * - { detail: string }   → detail
 * - { detail: object }   → JSON.stringify
 * - { detail: array }    → gabung pesan validasi FastAPI
 * - object lain          → JSON.stringify
 * - unknown              → fallback
 */
function parseErrMsg(err: unknown, fallback = 'Terjadi kesalahan.'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err || fallback

  const e = err as Record<string, unknown>

  // FastAPI validation error: { detail: [{loc, msg, type}, ...] }
  if (Array.isArray(e.detail)) {
    const msgs = (e.detail as Array<{ msg?: string; message?: string }>)
      .map(d => d.msg ?? d.message ?? JSON.stringify(d))
      .filter(Boolean)
    return msgs.length ? msgs.join('; ') : fallback
  }

  // { detail: string }
  if (typeof e.detail === 'string') return e.detail || fallback

  // { detail: { message, type } } ← penyebab React error #31
  if (e.detail && typeof e.detail === 'object') {
    const d = e.detail as Record<string, unknown>
    if (typeof d.message === 'string') return d.message
    return JSON.stringify(d)
  }

  // { message: string }
  if (typeof e.message === 'string') return e.message || fallback

  return JSON.stringify(err)
}

// ─── Constants ────────────────────────────────────────────────────
const STATUS_LABELS: Record<SBAStatus, string> = {
  pending_verification: 'Pending Verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  inactive: 'Tidak Aktif',
}

const STATUS_VARIANTS: Record<SBAStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_verification: 'secondary',
  verified: 'default',
  rejected: 'destructive',
  inactive: 'outline',
}

const BANK_CODES = [
  { code: '002', name: 'Bank BRI' },
  { code: '008', name: 'Bank Mandiri' },
  { code: '009', name: 'Bank BNI' },
  { code: '011', name: 'Bank Danamon' },
  { code: '013', name: 'Bank Permata' },
  { code: '014', name: 'Bank BCA' },
  { code: '016', name: 'Bank Maybank' },
  { code: '019', name: 'Bank Panin' },
  { code: '022', name: 'Bank CIMB Niaga' },
  { code: '023', name: 'Bank UOB Indonesia' },
  { code: '028', name: 'Bank OCBC NISP' },
  { code: '031', name: 'Citibank' },
  { code: '036', name: 'Bank Multicor / Windu' },
  { code: '046', name: 'Bank DKI' },
  { code: '054', name: 'Bank Capital Indonesia' },
  { code: '055', name: 'Bank BTPN' },
  { code: '061', name: 'Bank Bukopin' },
  { code: '069', name: 'Bank BRI Syariah' },
  { code: '076', name: 'Bank Bumi Arta' },
  { code: '110', name: 'Bank BJB' },
  { code: '111', name: 'Bank DKI Syariah' },
  { code: '200', name: 'Bank BTN' },
  { code: '212', name: 'Bank Woori Saudara' },
  { code: '422', name: 'Bank Syariah Indonesia (BSI)' },
  { code: '451', name: 'Bank Syariah Bukopin' },
  { code: '484', name: 'Bank KEB Hana Indonesia' },
  { code: '503', name: 'Bank Nobu' },
  { code: '513', name: 'Bank Ina Perdana' },
  { code: '517', name: 'Bank Panin Dubai Syariah' },
  { code: '520', name: 'Bank Prima Master' },
  { code: '521', name: 'Bank Jasa Jakarta' },
  { code: '523', name: 'Bank Harda Internasional' },
  { code: '526', name: 'Bank Bisnis Internasional' },
  { code: '531', name: 'Bank Sinarmas' },
  { code: '536', name: 'Bank OKE Indonesia' },
  { code: '542', name: 'Bank Artha Graha' },
  { code: '553', name: 'Bank Mayora' },
  { code: '555', name: 'Bank Index Selindo' },
  { code: '558', name: 'Bank Ganesha' },
  { code: '564', name: 'Bank Royal Indonesia' },
  { code: '566', name: 'Bank BNP Paribas Indonesia' },
  { code: '567', name: 'Bank SBI Indonesia' },
  { code: '668', name: 'Bank Mega' },
  { code: '688', name: 'Bank Bumiputera' },
  { code: '702', name: 'Bank BTPN Syariah' },
  { code: '706', name: 'Bank Syariah Mandiri' },
  { code: '777', name: 'Bank Sahabat Sampoerna' },
  { code: '787', name: 'Bank JAGO' },
  { code: '788', name: 'Bank Allo' },
  { code: '812', name: 'Bank Seabank Indonesia' },
  { code: '818', name: 'Bank Superbank' },
  { code: '868', name: 'Bank Neo Commerce (BNC)' },
]

export default function SettlementBankAccountPage() {
  const [items, setItems]               = useState<SettlementBankAccount[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [pageLoading, setPageLoading]   = useState(true)
  const [loading, setLoading]           = useState(false)
  const [syncingId, setSyncingId]       = useState<string | null>(null)
  const [syncingAll, setSyncingAll]     = useState(false)
  const [feedback, setFeedback]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [detailItem, setDetailItem]     = useState<SettlementBankAccount | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm]     = useState<SettlementBankAccountCreate>({
    bank_code: '', account_number: '', account_name: '', merchant_reference: '',
  })
  const [editItem, setEditItem]         = useState<SettlementBankAccount | null>(null)
  const [editForm, setEditForm]         = useState<SettlementBankAccountUpdate>({})

  const SIZE = 20

  // ─ helpers ───────────────────────────────────────────────────────────────
  const errFeedback = (err: unknown, fallback: string) =>
    setFeedback({ type: 'error', msg: parseErrMsg(err, fallback) })

  // ─ fetch ───────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setPageLoading(true)
    try {
      const res = await settlementBankAccountService.list({ page, size: SIZE, status: filterStatus || undefined })
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      errFeedback(err, 'Gagal memuat daftar settlement bank account.')
    } finally {
      setPageLoading(false)
    }
  }, [page, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchList() }, [fetchList])

  // ─ sync single ─────────────────────────────────────────────────────────
  const handleSync = async (item: SettlementBankAccount) => {
    setSyncingId(item.id)
    setFeedback(null)
    try {
      await settlementBankAccountService.sync(item.id)
      setFeedback({ type: 'success', msg: `Sync berhasil untuk rekening ${item.account_number}.` })
      fetchList()
    } catch (err) {
      errFeedback(err, 'Gagal sync status dari DOKU.')
    } finally {
      setSyncingId(null)
    }
  }

  // ─ sync all pending ───────────────────────────────────────────────
  const handleSyncAll = async () => {
    const pendingItems = items.filter(i => i.status === 'pending_verification')
    if (pendingItems.length === 0) {
      setFeedback({ type: 'error', msg: 'Tidak ada rekening berstatus Pending Verifikasi.' })
      return
    }
    setSyncingAll(true)
    setFeedback(null)
    let ok = 0, fail = 0
    for (const item of pendingItems) {
      try { await settlementBankAccountService.sync(item.id); ok++ }
      catch { fail++ }
    }
    setSyncingAll(false)
    setFeedback({
      type: fail === 0 ? 'success' : 'error',
      msg: `Sync selesai: ${ok} berhasil${fail > 0 ? `, ${fail} gagal` : ''}.`,
    })
    fetchList()
  }

  // ─ create ──────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setLoading(true)
    try {
      await settlementBankAccountService.create({
        ...createForm,
        merchant_reference: createForm.merchant_reference || undefined,
      })
      setFeedback({ type: 'success', msg: 'Settlement bank account berhasil dibuat.' })
      setShowCreateForm(false)
      setCreateForm({ bank_code: '', account_number: '', account_name: '', merchant_reference: '' })
      fetchList()
    } catch (err) {
      errFeedback(err, 'Gagal membuat settlement bank account.')
    } finally {
      setLoading(false)
    }
  }

  // ─ update ──────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editItem) return
    setLoading(true)
    try {
      await settlementBankAccountService.update(editItem.id, editForm)
      setFeedback({ type: 'success', msg: 'Settlement bank account berhasil diperbarui.' })
      setEditItem(null)
      fetchList()
    } catch (err) {
      errFeedback(err, 'Gagal memperbarui. Hanya akun berstatus verified yang bisa diupdate.')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (item: SettlementBankAccount) => {
    setEditItem(item)
    setEditForm({ account_name: item.account_name, merchant_reference: item.merchant_reference })
  }

  const openDetail = async (item: SettlementBankAccount) => {
    if (detailItem?.id === item.id) { setDetailItem(null); return }
    try {
      const data = await settlementBankAccountService.getById(item.id)
      setDetailItem(data)
    } catch (err) {
      errFeedback(err, 'Gagal memuat detail.')
    }
  }

  const pendingCount = items.filter(i => i.status === 'pending_verification').length
  const totalPages   = Math.ceil(total / SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement Bank Account</h1>
          <p className="text-muted-foreground text-sm">Kelola rekening bank settlement merchant via DOKU Bulk Registration Bank API.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleSyncAll}
            disabled={syncingAll || pageLoading}
            title="Sync semua rekening berstatus Pending Verifikasi dari DOKU"
          >
            {syncingAll ? '⏳ Syncing...' : `🔄 Sync Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
          </Button>
          <Button onClick={() => { setShowCreateForm(true); setFeedback(null) }}>
            + Tambah Rekening
          </Button>
        </div>
      </div>

      {/* Feedback — msg dijamin string, tidak akan trigger React #31 */}
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

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium">Filter Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-1.5 text-sm bg-background"
        >
          <option value="">Semua</option>
          {(Object.keys(STATUS_LABELS) as SBAStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">{total} total rekening</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Ref Merchant</th>
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 font-medium">No. Rekening</th>
              <th className="px-4 py-3 font-medium">Nama Rekening</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Memuat...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Belum ada data settlement bank account.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{item.merchant_reference ?? '-'}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="font-mono">{item.bank_code}</span>
                  {item.bank_name && <span className="ml-1 text-muted-foreground">({item.bank_name})</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{item.account_number}</td>
                <td className="px-4 py-3">{item.account_name}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANTS[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(item)}>
                      {detailItem?.id === item.id ? 'Tutup' : 'Detail'}
                    </Button>
                    {(item.status === 'pending_verification' || item.status === 'rejected') && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleSync(item)}
                        disabled={syncingId === item.id}
                        title="Perbarui status dari DOKU"
                      >
                        {syncingId === item.id ? '⏳' : '🔄'} Sync
                      </Button>
                    )}
                    {item.status === 'verified' && (
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {detailItem && (
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Detail: {detailItem.account_name}</h2>
            <div className="flex gap-2">
              {(detailItem.status === 'pending_verification' || detailItem.status === 'rejected') && (
                <Button size="sm" variant="outline"
                  onClick={() => handleSync(detailItem)}
                  disabled={syncingId === detailItem.id}
                >
                  {syncingId === detailItem.id ? '⏳ Syncing...' : '🔄 Sync dari DOKU'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDetailItem(null)}>Tutup</Button>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 divide-y text-sm">
            {([
              ['ID',                 detailItem.id],
              ['Bank Code',          detailItem.bank_code],
              ['Bank Name',          detailItem.bank_name ?? '-'],
              ['No. Rekening',       detailItem.account_number],
              ['Nama Rekening',      detailItem.account_name],
              ['Merchant Reference', detailItem.merchant_reference ?? '-'],
              ['Status',             STATUS_LABELS[detailItem.status]],
              ['Dibuat',             new Date(detailItem.created_at).toLocaleString('id-ID')],
              ['Diperbarui',         new Date(detailItem.updated_at).toLocaleString('id-ID')],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex items-start gap-4 px-4 py-2.5">
                <span className="text-muted-foreground text-xs font-medium w-40 shrink-0 pt-0.5">{k}</span>
                <span className="text-xs font-mono break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold tracking-tight">Tambah Settlement Bank Account</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium">Bank</label>
              <select
                value={createForm.bank_code}
                onChange={(e) => setCreateForm({ ...createForm, bank_code: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="">-- Pilih Bank --</option>
                {BANK_CODES.map(b => (
                  <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nomor Rekening</label>
              <input
                value={createForm.account_number}
                onChange={(e) => setCreateForm({ ...createForm, account_number: e.target.value })}
                placeholder="Contoh: 1234567890"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Rekening</label>
              <input
                value={createForm.account_name}
                onChange={(e) => setCreateForm({ ...createForm, account_name: e.target.value })}
                placeholder="Nama sesuai buku tabungan"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Merchant Reference{' '}
                <span className="text-muted-foreground text-xs">(opsional)</span>
              </label>
              <input
                value={createForm.merchant_reference}
                onChange={(e) => setCreateForm({ ...createForm, merchant_reference: e.target.value })}
                placeholder="REF-001"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background font-mono"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Batal</Button>
              <Button
                onClick={handleCreate}
                disabled={loading || !createForm.bank_code || !createForm.account_number || !createForm.account_name}
              >
                {loading ? 'Menyimpan...' : 'Daftarkan Rekening'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 mx-4">
            <h2 className="text-lg font-bold tracking-tight">Edit Settlement Bank Account</h2>
            <p className="text-xs text-muted-foreground">ID: {editItem.id}</p>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Rekening</label>
              <input
                value={editForm.account_name ?? ''}
                onChange={(e) => setEditForm({ ...editForm, account_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Merchant Reference{' '}
                <span className="text-muted-foreground text-xs">(opsional)</span>
              </label>
              <input
                value={editForm.merchant_reference ?? ''}
                onChange={(e) => setEditForm({ ...editForm, merchant_reference: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background font-mono"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
