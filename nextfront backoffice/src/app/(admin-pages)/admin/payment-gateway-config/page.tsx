'use client'

import { useEffect, useState } from 'react'
import { paymentGatewayConfigService } from '@/services/paymentGatewayConfig.service'
import type {
  PaymentGatewayConfig,
  PaymentGatewayConfigDetail,
  PaymentGatewayConfigCreate,
  PaymentGatewayConfigUpdate,
} from '@/types/paymentGatewayConfig'

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
  const [feedback, setFeedback]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchList = async () => {
    try {
      const data = await paymentGatewayConfigService.list()
      setConfigs(data)
    } catch {
      setFeedback({ type: 'error', msg: 'Gagal memuat daftar gateway.' })
    }
  }

  useEffect(() => { fetchList() }, [])

  const handleViewDetail = async (provider: string) => {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Gateway Config</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola dan aktifkan payment gateway (DOKU / Xendit)</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + Tambah Gateway
        </button>
      </div>

      {feedback && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} className="ml-3 underline text-xs">Tutup</button>
        </div>
      )}

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.length === 0 && (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            Belum ada gateway yang terdaftar. Klik <strong>+ Tambah Gateway</strong> untuk mulai.
          </div>
        )}
        {configs.map((cfg) => (
          <div
            key={cfg.provider}
            className={`rounded-xl border p-5 space-y-3 ${
              cfg.is_active ? 'border-green-400 bg-green-50' : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold capitalize">{cfg.label}</span>
                  {cfg.is_active && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">AKTIF</span>
                  )}
                  {cfg.is_production ? (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">PRODUCTION</span>
                  ) : (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">SANDBOX</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Provider: <code>{cfg.provider}</code></p>
                {cfg.notes && <p className="text-xs text-muted-foreground">{cfg.notes}</p>}
                {cfg.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Diperbarui: {new Date(cfg.updated_at).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {!cfg.is_active && (
                <button
                  onClick={() => handleActivate(cfg.provider)}
                  disabled={loading}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Aktifkan
                </button>
              )}
              <button
                onClick={() => openEditForm(cfg.provider)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
              >
                Edit Credentials
              </button>
              <button
                onClick={() => handleViewDetail(cfg.provider)}
                className="text-xs border px-3 py-1.5 rounded-lg hover:bg-accent"
              >
                Lihat Detail
              </button>
              {!cfg.is_active && (
                <button
                  onClick={() => handleDelete(cfg.provider)}
                  disabled={loading}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-50"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Detail: {detail.label}</h2>
            <button onClick={() => setDetail(null)} className="text-xs text-muted-foreground hover:underline">Tutup</button>
          </div>
          <div className="space-y-2">
            {Object.entries(detail.credentials).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="text-muted-foreground w-36 shrink-0 font-mono text-xs">{k}</span>
                <span className="font-mono break-all text-xs bg-muted px-2 py-0.5 rounded">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">
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
              <button
                onClick={() => setShowForm(false)}
                className="text-sm px-4 py-2 border rounded-lg hover:bg-accent"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : editProvider ? 'Simpan Perubahan' : 'Daftarkan Gateway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
