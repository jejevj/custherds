'use client'
import { useEffect, useState } from 'react'
import {
  webmailService, EmailConfig, EmailConfigPayload,
  TestEmailConfigPayload,
} from '@/services/webmail.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Plus, Pencil, Trash2, CheckCircle2, XCircle,
  FlaskConical, Star, ChevronDown, Eye, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PROVIDERS: EmailConfig['provider'][] = ['smtp', 'sendgrid', 'mailgun', 'ses', 'resend']

const EMPTY: EmailConfigPayload = {
  name: '', provider: 'smtp', host: '', port: 587,
  use_tls: true, username: '', password: '',
  from_address: '', from_name: '', is_default: false, is_active: true,
}

export default function EmailConfigContent() {
  const [configs,   setConfigs]   = useState<EmailConfig[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState<number | null>(null)
  const [form,      setForm]      = useState<EmailConfigPayload>({ ...EMPTY })
  const [saving,    setSaving]    = useState(false)
  const [showPass,  setShowPass]  = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testing,   setTesting]   = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    webmailService.listConfigs()
      .then(setConfigs)
      .catch(() => toast.error('Gagal memuat konfigurasi.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditId(null); setForm({ ...EMPTY }); setShowForm(true) }
  const openEdit = (c: EmailConfig) => {
    setEditId(c.id)
    setForm({
      name: c.name, provider: c.provider, host: c.host ?? '',
      port: c.port ?? 587, use_tls: c.use_tls, username: c.username,
      password: '', from_address: c.from_address, from_name: c.from_name ?? '',
      is_default: c.is_default, is_active: c.is_active,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.from_address || !form.username) {
      toast.error('Nama, username, dan from address wajib diisi.'); return
    }
    setSaving(true)
    try {
      if (editId) {
        const updated = await webmailService.updateConfig(editId, form)
        setConfigs(prev => prev.map(c => c.id === editId ? updated : c))
        toast.success('Konfigurasi berhasil diperbarui.')
      } else {
        const created = await webmailService.createConfig(form)
        setConfigs(prev => [...prev, created])
        toast.success('Konfigurasi berhasil dibuat.')
      }
      setShowForm(false)
    } catch {
      toast.error('Gagal menyimpan konfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus konfigurasi ini?')) return
    await webmailService.deleteConfig(id).catch(() => toast.error('Gagal menghapus.'))
    setConfigs(prev => prev.filter(c => c.id !== id))
    toast.success('Konfigurasi dihapus.')
  }

  const handleSetDefault = async (id: number) => {
    const updated = await webmailService.setDefault(id).catch(() => null)
    if (updated) setConfigs(prev => prev.map(c => ({ ...c, is_default: c.id === id })))
  }

  const handleTest = async (configId: number) => {
    if (!testEmail) { toast.error('Masukkan email penerima test dulu.'); return }
    setTesting(configId)
    const res = await webmailService.testConfig({ config_id: configId, send_to: testEmail } as TestEmailConfigPayload)
      .catch(() => null)
    setTesting(null)
    if (res?.success) toast.success(`Test berhasil! Latency: ${res.latency_ms}ms`)
    else toast.error(res?.message ?? 'Test gagal.')
  }

  const set = (k: keyof EmailConfigPayload, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Configurations</h1>
          <p className="text-muted-foreground text-sm">Kelola SMTP / provider email untuk Webmail.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1.5" /> Tambah Config</Button>
      </div>

      {/* Test email input */}
      <div className="flex gap-2 items-center">
        <Input
          value={testEmail} onChange={e => setTestEmail(e.target.value)}
          placeholder="Email untuk test koneksi…"
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">Isi dulu sebelum klik tombol Test di bawah.</p>
      </div>

      {/* Config list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl animate-pulse bg-white/5" />
        ))}</div>
      ) : configs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Belum ada konfigurasi.</p>
      ) : (
        <div className="space-y-3">
          {configs.map(c => (
            <div
              key={c.id}
              className={cn(
                'rounded-2xl border bg-white/5 backdrop-blur-md p-5',
                c.is_default ? 'border-primary/40' : 'border-white/10'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    {c.is_default && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                        <Star size={9} /> Default
                      </span>
                    )}
                    {c.is_active
                      ? <CheckCircle2 size={13} className="text-emerald-400" />
                      : <XCircle size={13} className="text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.from_name ? `${c.from_name} <${c.from_address}>` : c.from_address}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {c.provider}
                    {c.provider === 'smtp' && c.host && ` · ${c.host}:${c.port}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!c.is_default && (
                    <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => handleSetDefault(c.id)}>
                      <Star size={12} /> Set Default
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleTest(c.id)} disabled={testing === c.id}>
                    <FlaskConical size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editId ? 'Edit' : 'Tambah'} Konfigurasi Email</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><XCircle size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">Nama / Label</label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="mis. Gmail Custherds" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Provider</label>
                <div className="relative">
                  <select
                    value={form.provider}
                    onChange={e => set('provider', e.target.value)}
                    className="h-9 w-full rounded-lg border border-white/10 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none appearance-none"
                  >
                    {PROVIDERS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {form.provider === 'smtp' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Host</label>
                    <Input value={form.host ?? ''} onChange={e => set('host', e.target.value)} placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Port</label>
                    <Input type="number" value={form.port ?? 587} onChange={e => set('port', Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="tls" checked={form.use_tls} onChange={e => set('use_tls', e.target.checked)} className="rounded" />
                    <label htmlFor="tls" className="text-sm">Use TLS</label>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Username / API Key</label>
                <Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="user@gmail.com" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Password / Secret {editId && <span className="opacity-50">(kosongkan jika tidak diubah)</span>}</label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={editId ? '••••••••' : 'Password SMTP atau API secret'}
                    className="pr-9"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From Address</label>
                <Input value={form.from_address} onChange={e => set('from_address', e.target.value)} placeholder="no-reply@custherds.com" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From Name</label>
                <Input value={form.from_name ?? ''} onChange={e => set('from_name', e.target.value)} placeholder="Custherds" />
              </div>

              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)} className="rounded" />
                  Jadikan default
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
