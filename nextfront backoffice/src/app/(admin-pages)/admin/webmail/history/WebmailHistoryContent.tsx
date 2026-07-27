'use client'
import { useEffect, useState, useCallback } from 'react'
import { webmailService, EmailMessage } from '@/services/webmail.service'
import { formatDistanceToNow, format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Send, Search, RefreshCw, ChevronLeft, ChevronRight,
  Paperclip, Mail, X, Users, Eye,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function WebmailHistoryContent() {
  const [emails,   setEmails]   = useState<EmailMessage[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [preview,  setPreview]  = useState<EmailMessage | null>(null)

  const PER_PAGE = 20

  const load = useCallback(() => {
    setLoading(true); setError('')
    webmailService.listEmails({
      folder: 'sent',
      page,
      per_page: PER_PAGE,
      search: search || undefined,
    })
      .then(r => { setEmails(r.items); setTotal(r.total) })
      .catch(() => setError('Gagal memuat history email.'))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  // reset page saat search berubah
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History Email Terkirim</h1>
          <p className="text-muted-foreground text-sm">Semua email yang pernah dikirim via webmail admin.</p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={cn('mr-1.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari subjek atau penerima…"
              className="pl-7 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {loading ? 'Memuat…' : `${total} email terkirim`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 font-medium">Subjek</th>
                <th className="text-left px-4 py-3 font-medium">Penerima</th>
                <th className="text-left px-4 py-3 font-medium w-40">Waktu Kirim</th>
                <th className="text-left px-4 py-3 font-medium w-24">Status</th>
                <th className="text-center px-4 py-3 font-medium w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-destructive text-sm">{error}</td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Send size={32} className="opacity-20" />
                      <p className="text-sm">Belum ada email yang dikirim.</p>
                    </div>
                  </td>
                </tr>
              ) : emails.map((email, idx) => (
                <tr
                  key={email.id}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  {/* No */}
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(page - 1) * PER_PAGE + idx + 1}
                  </td>

                  {/* Subjek */}
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-foreground">{email.subject}</span>
                      {email.has_attachments && <Paperclip size={11} className="text-muted-foreground shrink-0" />}
                    </div>
                    {email.body_text && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[280px]">
                        {email.body_text.slice(0, 80)}
                      </p>
                    )}
                  </td>

                  {/* Penerima */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">
                        {email.to_addresses.length === 1
                          ? email.to_addresses[0]
                          : `${email.to_addresses[0]} dan ${email.to_addresses.length - 1} lainnya`
                        }
                      </span>
                    </div>
                    {email.to_addresses.length > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total {email.to_addresses.length} penerima
                      </p>
                    )}
                  </td>

                  {/* Waktu */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">
                      {format(new Date(email.created_at), 'dd MMM yyyy', { locale: localeId })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(email.created_at), 'HH:mm')}
                      {' · '}
                      {formatDistanceToNow(new Date(email.created_at), { addSuffix: true, locale: localeId })}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 rounded-full px-2 py-0.5">
                      <Mail size={10} /> Terkirim
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      title="Lihat isi email"
                      onClick={() => setPreview(email)}
                      className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3
                if (p < 1 || p > totalPages) return null
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? 'default' : 'ghost'}
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              })}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-background shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{preview.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari: <span className="text-foreground">{preview.from_name ? `${preview.from_name} <${preview.from_address}>` : preview.from_address}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Ke: <span className="text-foreground">{preview.to_addresses.join(', ')}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Dikirim: {format(new Date(preview.created_at), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-auto">
              {preview.body_html ? (
                <iframe
                  srcDoc={preview.body_html}
                  className="w-full h-full min-h-[400px] border-0 bg-white"
                  sandbox="allow-same-origin"
                  title="Preview email"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans p-5">
                  {preview.body_text ?? '(Tidak ada isi email)'}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
