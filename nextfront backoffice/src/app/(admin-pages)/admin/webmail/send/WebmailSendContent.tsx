'use client'
import { useEffect, useState } from 'react'
import { webmailService, EmailConfig, SendEmailPayload } from '@/services/webmail.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Plus, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

function TagInput({ value, onChange, placeholder }: {
  value: string[], onChange: (v: string[]) => void, placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft('')
  }
  return (
    <div className="flex flex-wrap gap-1.5 items-center border border-white/10 rounded-lg px-2 py-1.5 bg-background min-h-[2.25rem]">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
          {tag}
          <button onClick={() => onChange(value.filter(t => t !== tag))} type="button"><X size={10} /></button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
      />
    </div>
  )
}

export default function WebmailSendContent() {
  const [configs,  setConfigs]  = useState<EmailConfig[]>([])
  const [configId, setConfigId] = useState<number | ''>('')
  const [to,       setTo]       = useState<string[]>([])
  const [cc,       setCc]       = useState<string[]>([])
  const [bcc,      setBcc]      = useState<string[]>([])
  const [subject,  setSubject]  = useState('')
  const [body,     setBody]     = useState('')
  const [showCc,   setShowCc]   = useState(false)
  const [sending,  setSending]  = useState(false)

  useEffect(() => {
    webmailService.listConfigs()
      .then(list => {
        setConfigs(list)
        const def = list.find(c => c.is_default && c.is_active) ?? list.find(c => c.is_active)
        if (def) setConfigId(def.id)
      })
      .catch(() => {})
  }, [])

  const handleSend = async () => {
    if (!configId)          { toast.error('Pilih konfigurasi email terlebih dahulu.'); return }
    if (to.length === 0)    { toast.error('Masukkan minimal 1 penerima.'); return }
    if (!subject.trim())    { toast.error('Subject tidak boleh kosong.'); return }

    const payload: SendEmailPayload = {
      config_id: configId as number,
      to,
      cc:  cc.length  ? cc  : undefined,
      bcc: bcc.length ? bcc : undefined,
      subject,
      body_html: body,
      body_text: body.replace(/<[^>]*>/g, ''),
    }
    setSending(true)
    try {
      const res = await webmailService.sendEmail(payload)
      if (res.success) {
        toast.success(res.queued ? 'Email masuk antrian.' : 'Email berhasil dikirim!')
        setTo([]); setCc([]); setBcc([]); setSubject(''); setBody('')
      } else {
        toast.error('Gagal mengirim email.')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kirim Email</h1>
        <p className="text-muted-foreground text-sm">Compose dan kirim email dari akun yang dikonfigurasi.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">

        {/* Config select */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Kirim dari</label>
          <div className="relative">
            <select
              value={configId}
              onChange={e => setConfigId(e.target.value ? Number(e.target.value) : '')}
              className="h-9 w-full rounded-lg border border-white/10 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none appearance-none"
            >
              <option value="">— Pilih konfigurasi —</option>
              {configs.filter(c => c.is_active).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} &lt;{c.from_address}&gt;{c.is_default ? ' ★' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Kepada</label>
            <button onClick={() => setShowCc(v => !v)} className="text-[11px] text-primary hover:underline">
              {showCc ? 'Sembunyikan CC/BCC' : 'Tambah CC / BCC'}
            </button>
          </div>
          <TagInput value={to} onChange={setTo} placeholder="email@contoh.com, Enter untuk tambah…" />
        </div>

        {showCc && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">CC</label>
              <TagInput value={cc} onChange={setCc} placeholder="cc@contoh.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">BCC</label>
              <TagInput value={bcc} onChange={setBcc} placeholder="bcc@contoh.com" />
            </div>
          </>
        )}

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Subjek</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subjek email…" />
        </div>

        {/* Body — simple textarea, rich editor bisa di-swap */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Isi email <span className="opacity-50">(HTML diizinkan)</span></label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            placeholder="Tulis isi email di sini…"
            className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setTo([]); setCc([]); setBcc([]); setSubject(''); setBody('') }}>
            <X size={14} className="mr-1.5" /> Bersihkan
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sending}>
            <Send size={14} className="mr-1.5" />
            {sending ? 'Mengirim…' : 'Kirim Email'}
          </Button>
        </div>
      </div>
    </div>
  )
}
