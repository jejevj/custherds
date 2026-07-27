'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  webmailService,
  EmailConfig,
  SendEmailPayload,
  RecipientUser,
  RecipientGroup,
} from '@/services/webmail.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Send, X, ChevronDown, Users, UserCheck, User, Search,
  RefreshCw, ChevronRight, Check,
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Code, Quote, Heading2, Minus, Undo2, Redo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import LinkExt from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

// ── TagInput ──────────────────────────────────────────────────────────────────
function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string
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

// ── GroupBadge options ────────────────────────────────────────────────────────
const GROUP_OPTIONS: { key: RecipientGroup; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'guides',  label: 'Semua Guide',    icon: <UserCheck size={14} />, desc: 'Seluruh guide terdaftar' },
  { key: 'vendors', label: 'Semua Vendor',   icon: <Users size={14} />,     desc: 'Seluruh vendor terdaftar' },
  { key: 'all',     label: 'Guide + Vendor', icon: <Users size={14} />,     desc: 'Broadcast semua' },
  { key: 'custom',  label: 'Pilih Manual',   icon: <User size={14} />,      desc: 'Ketik / pilih email' },
]

// ── UserPickerPanel ───────────────────────────────────────────────────────────
function UserPickerPanel({ users, selected, onToggle, loading }: {
  users: RecipientUser[]; selected: Set<string>; onToggle: (email: string) => void; loading: boolean
}) {
  const [q, setQ] = useState('')
  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(q.toLowerCase()) ||
    (u.full_name ?? '').toLowerCase().includes(q.toLowerCase())
  )
  return (
    <div className="border border-white/10 rounded-xl bg-background/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <Search size={13} className="text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Cari nama atau email…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground" />
        {loading && <RefreshCw size={13} className="animate-spin text-muted-foreground" />}
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">{loading ? 'Memuat…' : 'Tidak ada hasil.'}</p>
        )}
        {filtered.map(u => (
          <button key={u.email} type="button" onClick={() => onToggle(u.email)}
            className={cn('w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5', selected.has(u.email) && 'bg-primary/10')}>
            <span className={cn('flex h-4 w-4 items-center justify-center rounded border border-white/20 flex-shrink-0', selected.has(u.email) ? 'bg-primary border-primary' : 'bg-transparent')}>
              {selected.has(u.email) && <Check size={10} className="text-white" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block truncate font-medium text-foreground">{u.full_name || u.email}</span>
              <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
            </span>
            <span className={cn('text-[10px] rounded-full px-1.5 py-0.5 flex-shrink-0',
              u.role === 'guide' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400')}>
              {u.role}
            </span>
          </button>
        ))}
      </div>
      {filtered.length > 0 && (
        <div className="px-3 py-1.5 border-t border-white/10 text-xs text-muted-foreground">
          {selected.size} dipilih dari {filtered.length} pengguna
        </div>
      )}
    </div>
  )
}

// ── WYSIWYG Toolbar ───────────────────────────────────────────────────────────
function ToolbarBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors text-sm',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const setLink = () => {
    const url = window.prompt('Masukkan URL:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else editor.chain().focus().unsetLink().run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-background/60">
      {/* Undo / Redo */}
      <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></ToolbarBtn>
      <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-white/15 mx-1" />

      {/* Heading */}
      <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={14} />
      </ToolbarBtn>

      {/* Inline marks */}
      <ToolbarBtn title="Bold" active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolbarBtn>
      <ToolbarBtn title="Italic" active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolbarBtn>
      <ToolbarBtn title="Underline" active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></ToolbarBtn>
      <ToolbarBtn title="Code" active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></ToolbarBtn>
      <ToolbarBtn title="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-white/15 mx-1" />

      {/* Lists */}
      <ToolbarBtn title="Bullet List" active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolbarBtn>
      <ToolbarBtn title="Ordered List" active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolbarBtn>
      <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolbarBtn>
      <ToolbarBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-white/15 mx-1" />

      {/* Alignment — method yang benar: setTextAlign (bukan setTextAlignment) */}
      <ToolbarBtn title="Rata Kiri" active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={14} /></ToolbarBtn>
      <ToolbarBtn title="Rata Tengah" active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={14} /></ToolbarBtn>
      <ToolbarBtn title="Rata Kanan" active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={14} /></ToolbarBtn>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WebmailSendContent() {
  const [configs,  setConfigs]  = useState<EmailConfig[]>([])
  const [configId, setConfigId] = useState<number | ''>('')

  const [group,         setGroup]         = useState<RecipientGroup>('custom')
  const [allUsers,      setAllUsers]      = useState<RecipientUser[]>([])
  const [loadingUsers,  setLoadingUsers]  = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())

  const [to,      setTo]      = useState<string[]>([])
  const [cc,      setCc]      = useState<string[]>([])
  const [bcc,     setBcc]     = useState<string[]>([])
  const [showCc,  setShowCc]  = useState(false)
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)

  // ── Tiptap editor ──
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Tulis isi email di sini… (HTML didukung penuh)' }),
    ],
    editorProps: {
      attributes: {
        class: [
          'min-h-[320px] px-4 py-3 text-sm text-foreground',
          'focus:outline-none',
          '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2',
          '[&_p]:my-1 [&_p]:leading-relaxed',
          '[&_strong]:font-bold [&_em]:italic [&_u]:underline',
          '[&_a]:text-primary [&_a]:underline',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1',
          '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:my-1',
          '[&_code]:bg-white/10 [&_code]:rounded [&_code]:px-1 [&_code]:text-xs [&_code]:font-mono',
          '[&_hr]:border-white/15 [&_hr]:my-3',
          '[&_.ProseMirror-focused]:outline-none',
        ].join(' '),
      },
    },
  })

  // Load configs
  useEffect(() => {
    webmailService.listConfigs()
      .then(list => {
        setConfigs(list)
        const def = list.find(c => c.is_default && c.is_active) ?? list.find(c => c.is_active)
        if (def) setConfigId(def.id)
      }).catch(() => {})
  }, [])

  // Load users saat grup berubah
  const loadUsers = useCallback(async (g: RecipientGroup) => {
    if (g === 'custom') { setAllUsers([]); return }
    setLoadingUsers(true)
    try {
      const [guides, vendors] = await Promise.all([
        g === 'guides' || g === 'all' ? webmailService.listGuides()  : Promise.resolve([]),
        g === 'vendors'|| g === 'all' ? webmailService.listVendors() : Promise.resolve([]),
      ])
      const merged = [...guides, ...vendors]
      setAllUsers(merged)
      setSelectedEmails(new Set(merged.map(u => u.email)))
    } catch {
      toast.error('Gagal memuat daftar pengguna.')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => { loadUsers(group) }, [group, loadUsers])

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev)
      next.has(email) ? next.delete(email) : next.add(email)
      return next
    })
  }

  const resolvedTo: string[] = group === 'custom' ? to : Array.from(selectedEmails)

  const handleSend = async () => {
    if (!configId)               { toast.error('Pilih konfigurasi email terlebih dahulu.'); return }
    if (resolvedTo.length === 0) { toast.error('Tidak ada penerima yang dipilih.'); return }
    if (!subject.trim())         { toast.error('Subject tidak boleh kosong.'); return }

    const bodyHtml = editor?.getHTML() ?? ''
    const bodyText = editor?.getText() ?? ''

    const payload: SendEmailPayload = {
      config_id: configId as number,
      to: resolvedTo,
      cc:  cc.length  ? cc  : undefined,
      bcc: bcc.length ? bcc : undefined,
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
    }
    setSending(true)
    try {
      const res = await webmailService.sendEmail(payload)
      if (res.success) {
        toast.success(res.queued ? 'Email masuk antrian.' : `Email berhasil dikirim ke ${resolvedTo.length} penerima!`)
        setTo([]); setCc([]); setBcc([]); setSubject('')
        editor?.commands.clearContent()
        setSelectedEmails(group !== 'custom' ? new Set(allUsers.map(u => u.email)) : new Set())
      } else {
        toast.error(res.detail ?? 'Gagal mengirim email.')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim.')
    } finally {
      setSending(false)
    }
  }

  const handleClear = () => {
    setTo([]); setCc([]); setBcc([]); setSubject('')
    editor?.commands.clearContent()
    if (group !== 'custom') loadUsers(group)
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kirim Email</h1>
        <p className="text-muted-foreground text-sm">Compose dan kirim email ke grup atau penerima tertentu.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 items-start">

        {/* Kolom kiri */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 space-y-4">
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

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Grup Penerima</label>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_OPTIONS.map(opt => (
                <button key={opt.key} type="button" onClick={() => setGroup(opt.key)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all',
                    group === opt.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-background/40 text-muted-foreground hover:border-white/20 hover:text-foreground'
                  )}>
                  <span className="flex items-center gap-1.5 font-medium text-xs">{opt.icon}{opt.label}</span>
                  <span className="text-[10px] opacity-70 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {group !== 'custom' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Penerima
                  {allUsers.length > 0 && <span className="ml-1.5 text-primary">({selectedEmails.size} / {allUsers.length} dipilih)</span>}
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedEmails(new Set(allUsers.map(u => u.email)))} className="text-[11px] text-primary hover:underline">Pilih Semua</button>
                  <span className="text-white/20">·</span>
                  <button type="button" onClick={() => setSelectedEmails(new Set())} className="text-[11px] text-muted-foreground hover:underline">Batal Semua</button>
                </div>
              </div>
              <UserPickerPanel users={allUsers} selected={selectedEmails} onToggle={toggleEmail} loading={loadingUsers} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Kepada</label>
                <button onClick={() => setShowCc(v => !v)} className="text-[11px] text-primary hover:underline">
                  {showCc ? 'Sembunyikan CC/BCC' : 'Tambah CC / BCC'}
                </button>
              </div>
              <TagInput value={to} onChange={setTo} placeholder="email@contoh.com — tekan Enter untuk tambah" />
              {showCc && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">CC</label>
                    <TagInput value={cc} onChange={setCc} placeholder="cc@contoh.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">BCC</label>
                    <TagInput value={bcc} onChange={setBcc} placeholder="bcc@contoh.com" />
                  </div>
                </>
              )}
            </div>
          )}

          {group !== 'custom' && resolvedTo.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
              <ChevronRight size={11} className="inline mr-1 text-primary" />
              Email ke <span className="text-foreground font-medium">{resolvedTo.length} penerima</span>:
              {' '}{resolvedTo.slice(0, 3).join(', ')}{resolvedTo.length > 3 && ` dan ${resolvedTo.length - 3} lainnya`}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Subjek</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subjek email…" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X size={12} /> Bersihkan
            </button>
            <Button size="sm" onClick={handleSend} disabled={sending || resolvedTo.length === 0}>
              <Send size={14} className="mr-1.5" />
              {sending ? 'Mengirim…' : resolvedTo.length > 1 ? `Kirim ke ${resolvedTo.length} Penerima` : 'Kirim Email'}
            </Button>
          </div>
        </div>

        {/* Kolom kanan: Editor */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium">Isi Email</span>
            <span className="text-xs text-muted-foreground">HTML • WYSIWYG Editor</span>
          </div>
          <EditorToolbar editor={editor} />
          <div className="flex-1 overflow-y-auto">
            <EditorContent
              editor={editor}
              className="h-full [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror-placeholder]:text-muted-foreground [&_.ProseMirror-placeholder]:pointer-events-none"
            />
          </div>
          <div className="px-4 py-2 border-t border-white/10 text-[11px] text-muted-foreground">
            Output dikirim sebagai HTML ke backend • plain-text fallback otomatis di-strip
          </div>
        </div>
      </div>
    </div>
  )
}
