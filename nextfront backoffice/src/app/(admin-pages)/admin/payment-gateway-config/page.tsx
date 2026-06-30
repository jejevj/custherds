'use client'

import { useEffect, useState } from 'react'
import { paymentGatewayConfigService } from '@/services/paymentGatewayConfig.service'
import type {
  PaymentGatewayConfig,
  PaymentGatewayConfigDetail,
  PaymentGatewayConfigCreate,
  PaymentGatewayConfigUpdate,
} from '@/types/paymentGatewayConfig'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PROVIDERS = [
  { key: 'xendit', label: 'Xendit Invoice' },
  { key: 'doku',   label: 'DOKU SNAP' },
]

const CREDENTIAL_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  xendit: [
    { key: 'api_key',       label: 'API Key',       placeholder: 'xnd_development_...' },
    { key: 'webhook_token', label: 'Webhook Token', placeholder: 'Token dari dashboard Xendit' },
  ],
  doku: [
    { key: 'client_id',   label: 'Client ID',   placeholder: 'Client ID dari DOKU' },
    { key: 'secret_key',  label: 'Secret Key',  placeholder: 'Secret Key dari DOKU' },
    { key: 'private_key', label: 'Private Key', placeholder: 'Private Key (PEM)' },
    { key: 'public_key',  label: 'Public Key',  placeholder: 'Public Key (PEM)' },
  ],
}

export default function PaymentGatewayConfigPage() {
  const [configs, setConfigs]               = useState<PaymentGatewayConfig[]>([])
  const [detail, setDetail]                 = useState<PaymentGatewayConfigDetail | null>(null)
  const [editProvider, setEditProvider]     = useState<string | null>(null)
  const [showForm, setShowForm]             = useState(false)
  const [formProvider, setFormProvider]     = useState('xendit')
  const [formFields, setFormFields]         = useState<Record<string, string>>({})
  const [formProduction, setFormProduction] = useState(false)
  const [formLabel, setFormLabel]           = useState('')
  const [formNotes, setFormNotes]           = useState('')
  const [loading, setLoading]               = useState(false)
  const [pageLoading, setPageLoading]       = useState(true)
  const [error, setError]                   = useState('')
  const [feedback, setFeedback]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchList = async () => {
    try {
      const data = await paymentGatewayConfigService.list()
      setConfigs(data)
    } catch {
      setError('Gagal memuat daftar gateway.')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const handleViewDetail = async (provider: string) => {
    if (detail?.provider === provider) { setDetail(null); return }
    try {
      const data = await paymentGatewayConfigService.getDetail(provider)
      setDetail(data)
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal memuat detail gateway.' })
    }
  }

  const handleActivate = async (provider: string) => {
    setLoading(true)
    try {
      await paymentGatewayConfigService.activate(provider)
      setFeedback({ type: 'success', msg: `Gateway "${provider}" berhasil diaktifkan.` })
      fetchList()
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal mengaktifkan gateway.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (provider: string) => {
    if (!confirm(`Hapus gateway "${provider}"? Aksi ini tidak dapat dibatalkan.`)) return
    setLoading(true)
    try {
      await paymentGatewayConfigService.delete(provider)
      setFeedback({ type: 'success', msg: `Gateway "${provider}" berhasil dihapus.` })
      fetchList()
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal menghapus gateway. Pastikan gateway tidak sedang aktif.' })
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditProvider(null)
    setFormProvider('xendit')
    setFormLabel('Xendit Invoice')
    setFormProduction(false)
    setFormFields({})
    setFormNotes('')
    setShowForm(true)
  }

  const openEditForm = async (provider: string) => {
    try {
      const d = await paymentGatewayConfigService.getDetail(provider)
      setEditProvider(provider)
      setFormProvider(provider)
      setFormLabel(d.label)
      setFormProduction(d.is_production)
      setFormFields(d.credentials ?? {})
      setFormNotes(d.notes ?? '')
      setShowForm(true)
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal memuat data untuk edit.' })
    }
  }

  const handleProviderChange = (p: string) => {
    setFormProvider(p)
    setFormLabel(PROVIDERS.find(x => x.key === p)?.label ?? '')
    setFormFields({})
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (editProvider) {
        const payload: PaymentGatewayConfigUpdate = {
          label: formLabel,
          is_production: formProduction,
          credentials: formFields,
          notes: formNotes || undefined,
        }
        await paymentGatewayConfigService.update(editProvider, payload)
        setFeedback({ type: 'success', msg: 'Konfigurasi berhasil diperbarui.' })
      } else {
        const payload: PaymentGatewayConfigCreate = {
          provider: formProvider,
          label: formLabel,
          is_production: formProduction,
          credentials: formFields,
          notes: formNotes || undefined,
        }
        await paymentGatewayConfigService.create(payload)
        setFeedback({ type: 'success', msg: 'Gateway berhasil didaftarkan.' })
      }
      setShowForm(false)
      fetchList()
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal menyimpan konfigurasi.' })
    } finally {
      setLoading(false)
    }
  }

  const credFields = CREDENTIAL_FIELDS[formProvider] ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Gateway Config</h1>
          <p className="text-muted-foreground">Kelola dan aktifkan payment gateway (DOKU / Xendit).</p>
        </div>
        <Button onClick={openAddForm}>+ Tambah Gateway</Button>
      </div>

      {/* Feedback */}
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Diperbarui</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">Memuat...</td>
              </tr>
            ) : configs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada gateway terdaftar.
                </td>
              </tr>
            ) : configs.map((cfg) => (
              <tr key={cfg.provider} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{cfg.provider}</td>
                <td className="px-4 py-3 font-medium">{cfg.label}</td>
                <td className="px-4 py-3">
                  <Badge variant={cfg.is_production ? 'destructive' : 'secondary'}>
                    {cfg.is_production ? 'Production' : 'Sandbox'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={cfg.is_active ? 'default' : 'secondary'}>
                    {cfg.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {cfg.updated_at ? new Date(cfg.updated_at).toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {!cfg.is_active && (
                      <Button size="sm" disabled={loading} onClick={() => handleActivate(cfg.provider)}>
                        Aktifkan
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEditForm(cfg.provider)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetail(cfg.provider)}>
                      {detail?.provider === cfg.provider ? 'Tutup Detail' : 'Detail'}
                    </Button>
                    {!cfg.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loading}
                        onClick={() => handleDelete(cfg.provider)}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Detail Credentials: {detail.label}</h2>
            <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>Tutup</Button>
          </div>
          <div className="rounded-lg border bg-muted/40 divide-y">
            {Object.entries(detail.credentials).map(([k, v]) => (
              <div key={k} className="flex items-start gap-4 px-4 py-3">
                <span className="text-muted-foreground font-mono text-xs w-36 shrink-0 pt-0.5">{k}</span>
                <span className="font-mono text-xs break-all">{v}</span>
              </div>
            ))}
          </div>
          {detail.notes && (
            <p className="text-sm text-muted-foreground">Catatan: {detail.notes}</p>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold tracking-tight">
              {editProvider ? `Edit Gateway: ${editProvider}` : 'Tambah Gateway Baru'}
            </h2>

            {!editProvider && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Provider</label>
                <select
                  value={formProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label} ({p.key})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Label</label>
              <input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                placeholder="Contoh: Xendit Invoice"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_production"
                type="checkbox"
                checked={formProduction}
                onChange={(e) => setFormProduction(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_production" className="text-sm font-medium">
                Production Mode
                <span className="ml-1 text-xs text-muted-foreground">(centang jika bukan sandbox)</span>
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Credentials</p>
              {credFields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">{f.label}</label>
                  <input
                    value={formFields[f.key] ?? ''}
                    onChange={(e) => setFormFields({ ...formFields, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Catatan (opsional)</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                placeholder="Catatan tambahan untuk gateway ini"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Menyimpan...' : editProvider ? 'Simpan Perubahan' : 'Daftarkan Gateway'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
