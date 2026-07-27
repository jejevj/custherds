'use client'
import { useEffect, useState, useCallback } from 'react'
import { webmailService, EmailMessage, ListEmailsParams } from '@/services/webmail.service'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Mail, MailOpen, Star, Trash2, Search, RefreshCw,
  Inbox, Send, Archive, AlertOctagon, ChevronLeft, Paperclip,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FOLDERS: { value: EmailMessage['folder']; label: string; icon: React.ElementType }[] = [
  { value: 'inbox',  label: 'Inbox',     icon: Inbox },
  { value: 'sent',   label: 'Terkirim',  icon: Send },
  { value: 'draft',  label: 'Draft',     icon: Archive },
  { value: 'spam',   label: 'Spam',      icon: AlertOctagon },
  { value: 'trash',  label: 'Sampah',    icon: Trash2 },
]

export default function WebmailInboxContent() {
  const [folder,   setFolder]   = useState<EmailMessage['folder']>('inbox')
  const [emails,   setEmails]   = useState<EmailMessage[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<EmailMessage | null>(null)
  const [error,    setError]    = useState('')

  const load = useCallback((params?: Partial<ListEmailsParams>) => {
    setLoading(true); setError('')
    webmailService.listEmails({ folder, search: search || undefined, page, per_page: 20, ...params })
      .then(r => { setEmails(r.items); setTotal(r.total) })
      .catch(() => setError('Gagal memuat email.'))
      .finally(() => setLoading(false))
  }, [folder, search, page])

  useEffect(() => { load() }, [load])

  const openEmail = async (email: EmailMessage) => {
    setSelected(email)
    if (!email.is_read) {
      const updated = await webmailService.markRead(email.id, true).catch(() => email)
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e))
      setSelected({ ...updated, is_read: true })
    }
  }

  const toggleStar = async (e: React.MouseEvent, email: EmailMessage) => {
    e.stopPropagation()
    const updated = await webmailService.markStarred(email.id, !email.is_starred).catch(() => email)
    setEmails(prev => prev.map(m => m.id === email.id ? updated : m))
    if (selected?.id === email.id) setSelected(updated)
  }

  const moveTrash = async (e: React.MouseEvent, email: EmailMessage) => {
    e.stopPropagation()
    await webmailService.moveFolder(email.id, 'trash').catch(() => null)
    setEmails(prev => prev.filter(m => m.id !== email.id))
    if (selected?.id === email.id) setSelected(null)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">

      {/* Folder sidebar */}
      <aside className="w-40 shrink-0 border-r border-white/10 p-3 space-y-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest px-2 pb-1">Folder</p>
        {FOLDERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setFolder(f.value); setPage(1); setSelected(null) }}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors',
              folder === f.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </aside>

      {/* Email list */}
      <div className={cn('flex flex-col border-r border-white/10 transition-all', selected ? 'w-72 shrink-0' : 'flex-1')}>
        <div className="p-3 border-b border-white/10 flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari…" className="pl-7 h-8 text-sm" />
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => load()}>
            <RefreshCw size={13} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 mx-3 my-2 rounded-lg animate-pulse bg-white/5" />
            ))
          ) : error ? (
            <p className="text-center text-sm text-destructive p-8">{error}</p>
          ) : emails.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground p-8">Tidak ada email.</p>
          ) : emails.map(email => (
            <button
              key={email.id}
              onClick={() => openEmail(email)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                selected?.id === email.id && 'bg-primary/10',
                !email.is_read && 'bg-white/[0.03]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {email.is_read
                    ? <MailOpen size={13} className="text-muted-foreground shrink-0" />
                    : <Mail size={13} className="text-primary shrink-0" />}
                  <span className={cn('text-xs truncate', !email.is_read && 'font-semibold text-foreground')}>
                    {email.from_name ?? email.from_address}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {email.attachments.length > 0 && <Paperclip size={11} className="text-muted-foreground" />}
                  <button onClick={e => toggleStar(e, email)}>
                    <Star size={12} className={cn(email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400')} />
                  </button>
                </div>
              </div>
              <p className={cn('text-xs mt-0.5 truncate', !email.is_read ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {email.subject}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(
                  new Date(email.received_at ?? email.created_at),
                  { addSuffix: true, locale: localeId }
                )}
              </p>
            </button>
          ))}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-muted-foreground">
            <span>{total} email</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 px-2" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
              <span className="px-1">{page}</span>
              <Button size="sm" variant="ghost" className="h-6 px-2" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>›</Button>
            </div>
          </div>
        )}
      </div>

      {/* Email detail */}
      {selected && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelected(null)}>
              <ChevronLeft size={16} />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selected.subject}</p>
              <p className="text-xs text-muted-foreground">
                {selected.from_name ? `${selected.from_name} <${selected.from_address}>` : selected.from_address}
              </p>
            </div>
            <button onClick={e => moveTrash(e, selected)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-5">
            {selected.body_html ? (
              <iframe
                srcDoc={selected.body_html}
                className="w-full h-full border-0 rounded-lg bg-white"
                sandbox="allow-same-origin"
                title="Email content"
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{selected.body_text}</pre>
            )}
          </div>
          {selected.attachments.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground mb-2">Lampiran ({selected.attachments.length})</p>
              <div className="flex flex-wrap gap-2">
                {selected.attachments.map(a => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors"
                  >
                    <Paperclip size={11} /> {a.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
