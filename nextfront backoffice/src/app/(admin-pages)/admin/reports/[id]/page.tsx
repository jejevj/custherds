"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  adminReportsService,
  AdminReportUpdate,
} from "@/services/admin-reports.service"
import {
  BookingReport,
  REPORT_TYPE_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
} from "@/services/booking-reports.service"
import { webmailService, EmailConfig } from "@/services/webmail.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, AlignLeft, CheckCircle2, Clock, Calendar,
  Mail, Send, ChevronDown, Loader2, X, RefreshCw, User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExt from "@tiptap/extension-underline"
import LinkExt from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, AlignLeft as ALeft, AlignCenter, AlignRight,
  Code, Quote, Minus, Undo2, Redo2, Link as LinkIcon, Heading2,
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────────
function buildEmailFooterHtml(r: BookingReport): string {
  const createdAt = new Date(r.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
  const bookingDate = r.booking?.booking_date
    ? new Date(r.booking.booking_date).toLocaleDateString("id-ID", { dateStyle: "long" })
    : "-"

  const rows = [
    ["Nomor Laporan",   `<strong style='font-family:monospace'>${r.report_code}</strong>`],
    ["Jenis Laporan",   REPORT_TYPE_LABEL[r.report_type] ?? r.report_type],
    ["Status Saat Ini", REPORT_STATUS_LABEL[r.status] ?? r.status],
    ["Tanggal Laporan", createdAt],
    ...(r.booking ? [
      ["Kode Booking",   `<span style='font-family:monospace'>${r.booking.booking_code}</span>`],
      ["Tanggal Booking", bookingDate],
    ] : []),
    ...(r.transaction ? [
      ["Kode Transaksi",  `<span style='font-family:monospace'>${r.transaction.transaction_code}</span>`],
      ["Total Transaksi", `Rp ${Number(r.transaction.gross_amount).toLocaleString("id-ID")}`],
    ] : []),
    ["Deskripsi Laporan", r.description],
  ] as [string, string][]

  const tableRows = rows.map(([label, val]) =>
    `<tr>
      <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:#111827;">${val}</td>
    </tr>`
  ).join("\n")

  return `
<div style="margin-top:32px;border-top:2px solid #e5e7eb;padding-top:20px;font-family:Arial,sans-serif;">
  <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Detail Laporan — CustHerds</p>
  <table style="border-collapse:collapse;width:100%;">
    ${tableRows}
  </table>
  <div style="margin-top:20px;background:#f3f4f6;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:4px;">
    <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:600;">&#9993; Cara Membalas</p>
    <p style="margin:6px 0 0;font-size:13px;color:#374151;">
      Untuk melanjutkan komunikasi terkait laporan ini, silakan gunakan fitur <strong>Reply</strong> pada email ini.
      Pastikan nomor laporan <strong style='font-family:monospace;'>${r.report_code}</strong> tetap tercantum di subjek
      agar tim kami dapat memproses laporan Anda dengan lebih cepat.
    </p>
  </div>
  <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;">
    Email ini dikirim secara otomatis oleh sistem CustHerds. Jangan balas langsung ke alamat ini —
    gunakan tombol <em>Reply</em> untuk memastikan pesan Anda tercatat dengan benar.
  </p>
</div>`
}

function buildEmailFooterText(r: BookingReport): string {
  const createdAt = new Date(r.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
  return [
    "",
    "---",
    "DETAIL LAPORAN — CustHerds",
    `Nomor Laporan  : ${r.report_code}`,
    `Jenis Laporan  : ${REPORT_TYPE_LABEL[r.report_type] ?? r.report_type}`,
    `Status         : ${REPORT_STATUS_LABEL[r.status] ?? r.status}`,
    `Tanggal        : ${createdAt}`,
    ...(r.booking  ? [`Kode Booking   : ${r.booking.booking_code}`]  : []),
    ...(r.transaction ? [`Kode Transaksi : ${r.transaction.transaction_code}`] : []),
    `Deskripsi      : ${r.description}`,
    "",
    "CARA MEMBALAS",
    `Gunakan fitur Reply pada email ini dan sertakan nomor laporan ${r.report_code} di subjek`,
    "agar tim kami dapat memproses laporan Anda.",
    "",
    "Email ini dikirim otomatis oleh sistem CustHerds.",
  ].join("\n")
}

// ── Info Row ──────────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-52">{label}</span>
      <span className="text-sm font-medium text-right flex-1">{children}</span>
    </div>
  )
}

// ── WYSIWYG Toolbar ─────────────────────────────────────────────────────────
function ToolbarBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors text-sm",
        active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null
  const setLink = () => {
    const url = window.prompt("URL:")
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else editor.chain().focus().unsetLink().run()
  }
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
      <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></ToolbarBtn>
      <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-border mx-1" />
      <ToolbarBtn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></ToolbarBtn>
      <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolbarBtn>
      <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolbarBtn>
      <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></ToolbarBtn>
      <ToolbarBtn title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></ToolbarBtn>
      <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-border mx-1" />
      <ToolbarBtn title="Bullet" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolbarBtn>
      <ToolbarBtn title="Ordered" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolbarBtn>
      <ToolbarBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolbarBtn>
      <ToolbarBtn title="HR" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></ToolbarBtn>
      <span className="w-px h-4 bg-border mx-1" />
      <ToolbarBtn title="Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><ALeft size={14} /></ToolbarBtn>
      <ToolbarBtn title="Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={14} /></ToolbarBtn>
      <ToolbarBtn title="Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={14} /></ToolbarBtn>
    </div>
  )
}

// ── CC Tag Input ────────────────────────────────────────────────────────────
function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft("")
  }
  return (
    <div className="flex flex-wrap gap-1.5 items-center border rounded-lg px-2 py-1.5 bg-background min-h-[2.25rem]">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
          {tag}
          <button onClick={() => onChange(value.filter(t => t !== tag))} type="button"><X size={10} /></button>
        </span>
      ))}
      <input
        value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

// ── Email Footer Preview ─────────────────────────────────────────────────────────
function EmailFooterPreview({ report }: { report: BookingReport }) {
  const bookingDate = report.booking?.booking_date
    ? new Date(report.booking.booking_date).toLocaleDateString("id-ID", { dateStyle: "long" })
    : null
  const createdAt = new Date(report.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4 space-y-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
        Footer otomatis (tidak dapat diedit)
      </div>

      <div className="border-t pt-3 space-y-1">
        <p className="font-semibold text-[11px] uppercase tracking-wide mb-2">Detail Laporan — CustHerds</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <span className="text-muted-foreground">Nomor Laporan</span>
          <span className="font-mono font-medium text-foreground">{report.report_code}</span>
          <span className="text-muted-foreground">Jenis Laporan</span>
          <span>{REPORT_TYPE_LABEL[report.report_type] ?? report.report_type}</span>
          <span className="text-muted-foreground">Status</span>
          <span>{REPORT_STATUS_LABEL[report.status] ?? report.status}</span>
          <span className="text-muted-foreground">Tanggal Laporan</span>
          <span>{createdAt}</span>
          {report.booking && (
            <>
              <span className="text-muted-foreground">Kode Booking</span>
              <span className="font-mono">{report.booking.booking_code}</span>
              <span className="text-muted-foreground">Tanggal Booking</span>
              <span>{bookingDate}</span>
            </>
          )}
          {report.transaction && (
            <>
              <span className="text-muted-foreground">Kode Transaksi</span>
              <span className="font-mono">{report.transaction.transaction_code}</span>
              <span className="text-muted-foreground">Total Transaksi</span>
              <span>Rp {Number(report.transaction.gross_amount).toLocaleString("id-ID")}</span>
            </>
          )}
        </div>

        <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
          <p className="text-blue-700 dark:text-blue-400 font-semibold mb-0.5">&#9993; Cara Membalas</p>
          <p className="text-blue-600 dark:text-blue-300 leading-relaxed">
            Gunakan fitur <strong>Reply</strong> pada email ini. Pastikan nomor laporan
            <span className="font-mono font-bold mx-1">{report.report_code}</span>
            tetap tercantum di subjek agar tim kami dapat memproses laporan Anda.
          </p>
        </div>

        <p className="pt-2 text-[11px] text-muted-foreground/70 italic">
          Email ini dikirim otomatis oleh sistem CustHerds.
        </p>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [report,  setReport]  = useState<BookingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  // ── Status form
  const [newStatus,    setNewStatus]    = useState<AdminReportUpdate["status"] | "">("")
  const [notes,        setNotes]        = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMsg,    setStatusMsg]    = useState("")

  // ── Email form
  const [configs,  setConfigs]  = useState<EmailConfig[]>([])
  const [configId, setConfigId] = useState<number | "">("")
  const [emailCc,  setEmailCc]  = useState<string[]>([])
  const [subject,  setSubject]  = useState("")
  const [sending,  setSending]  = useState(false)
  const [emailMsg, setEmailMsg] = useState("")
  const [showCc,   setShowCc]   = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis pesan balasan untuk guide di sini..." }),
    ],
    editorProps: {
      attributes: {
        class: [
          "min-h-[180px] px-4 py-3 text-sm focus:outline-none",
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2",
          "[&_p]:my-1 [&_p]:leading-relaxed",
          "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
          "[&_a]:text-primary [&_a]:underline",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:text-xs [&_code]:font-mono",
          "[&_hr]:border-border [&_hr]:my-3",
        ].join(" "),
      },
    },
  })

  const prefillEmail = useCallback((r: BookingReport) => {
    setSubject(`[${r.report_code}] Tindak Lanjut Laporan Booking`)
  }, [])

  useEffect(() => {
    if (!id) return
    Promise.all([
      adminReportsService.get(id),
      webmailService.listConfigs(),
    ])
      .then(([r, cfgs]) => {
        setReport(r)
        setNewStatus(r.status as AdminReportUpdate["status"])
        setNotes(r.resolution_notes ?? "")
        prefillEmail(r)
        setConfigs(cfgs)
        const def = cfgs.find(c => c.is_default && c.is_active) ?? cfgs.find(c => c.is_active)
        if (def) setConfigId(def.id)
      })
      .catch(() => setError("Gagal memuat data laporan."))
      .finally(() => setLoading(false))
  }, [id, prefillEmail])

  // ── Update Status
  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!newStatus || !report) return
    setSavingStatus(true)
    setStatusMsg("")
    try {
      const updated = await adminReportsService.update(report.id, {
        status: newStatus as AdminReportUpdate["status"],
        resolution_notes: notes.trim() || undefined,
      })
      setReport(updated)
      setStatusMsg("✓ Status berhasil diperbarui.")
    } catch {
      setStatusMsg("✗ Gagal memperbarui status.")
    } finally {
      setSavingStatus(false)
    }
  }

  // ── Send Email — body = konten editor + footer otomatis
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!configId)            { setEmailMsg("✗ Pilih konfigurasi email."); return }
    if (!report?.guide_email) { setEmailMsg("✗ Email guide tidak tersedia."); return }
    if (!subject.trim())      { setEmailMsg("✗ Subjek tidak boleh kosong."); return }

    const editorHtml = editor?.getHTML() ?? ""
    const editorText = editor?.getText() ?? ""
    const footerHtml = buildEmailFooterHtml(report)
    const footerText = buildEmailFooterText(report)

    const finalHtml = `${editorHtml}${footerHtml}`
    const finalText = `${editorText}${footerText}`

    setSending(true)
    setEmailMsg("")
    try {
      const res = await adminReportsService.sendEmail({
        config_id:   configId as number,
        report_code: report.report_code,
        to:          [report.guide_email],
        cc:          emailCc.length ? emailCc : undefined,
        subject,
        body_html:   finalHtml,
        body_text:   finalText,
      })
      if (res.success) {
        setEmailMsg(`✓ Email berhasil dikirim ke ${report.guide_email}.`)
        editor?.commands.clearContent()
      } else {
        setEmailMsg(`✗ ${res.detail ?? "Gagal mengirim email."}`)
      }
    } catch {
      setEmailMsg("✗ Terjadi kesalahan saat mengirim email.")
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-muted-foreground">Memuat...</div>
  if (error)   return <div className="py-20 text-center text-red-500">{error}</div>
  if (!report) return null

  const bookingDate = report.booking?.booking_date
    ? new Date(report.booking.booking_date).toLocaleDateString("id-ID", { dateStyle: "long" })
    : "-"

  const createdAt = new Date(report.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  const reviewedAt = report.reviewed_at
    ? new Date(report.reviewed_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null

  const isStatusSuccess = statusMsg.startsWith("✓")
  const isEmailSuccess  = emailMsg.startsWith("✓")

  return (
    <div className="space-y-6 w-full">
      {/* Back */}
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground"
        onClick={() => router.push("/admin/reports")}>
        <ArrowLeft size={15} className="mr-1" /> Kembali ke Laporan
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Laporan</h1>
          <p className="text-muted-foreground font-mono text-sm mt-0.5">{report.report_code}</p>
        </div>
        <Badge variant={REPORT_STATUS_VARIANT[report.status] ?? "secondary"} className="text-sm px-3 py-1">
          {REPORT_STATUS_LABEL[report.status] ?? report.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

        {/* ── Kolom Kiri: Info Laporan ── */}
        <div className="space-y-5">

          {/* Info Laporan */}
          <div className="rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Informasi Laporan</h2>
            <InfoRow label="Kode Laporan"><span className="font-mono">{report.report_code}</span></InfoRow>
            <InfoRow label="Jenis Laporan">{REPORT_TYPE_LABEL[report.report_type] ?? report.report_type}</InfoRow>
            <InfoRow label="Guide Pelapor">
              <span className="flex items-center justify-end gap-1.5">
                <User size={13} className="text-muted-foreground" />
                <span>{report.guide_name ?? "-"}</span>
              </span>
            </InfoRow>
            <InfoRow label="Email Guide">
              <span className="flex items-center justify-end gap-1.5">
                <Mail size={13} className="text-muted-foreground" />
                <span className="font-mono text-xs">{report.guide_email ?? "-"}</span>
              </span>
            </InfoRow>
            <InfoRow label="Tanggal Dibuat">
              <span className="flex items-center justify-end gap-1"><Clock size={13} />{createdAt}</span>
            </InfoRow>
            {reviewedAt && (
              <InfoRow label="Ditinjau Pada">
                <span className="flex items-center justify-end gap-1"><CheckCircle2 size={13} />{reviewedAt}</span>
              </InfoRow>
            )}
          </div>

          {/* Booking Terkait */}
          {report.booking && (
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Booking Terkait</h2>
              <InfoRow label="Kode Booking"><span className="font-mono">{report.booking.booking_code}</span></InfoRow>
              <InfoRow label="Tanggal Booking">
                <span className="flex items-center justify-end gap-1"><Calendar size={13} />{bookingDate}</span>
              </InfoRow>
              <InfoRow label="Status Booking">{report.booking.status}</InfoRow>
              {report.booking.vendor_rejection_reason && (
                <InfoRow label="Alasan Penolakan">{report.booking.vendor_rejection_reason}</InfoRow>
              )}
            </div>
          )}

          {/* Transaksi */}
          {report.transaction && (
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Transaksi Terkait</h2>
              <InfoRow label="Kode Transaksi"><span className="font-mono">{report.transaction.transaction_code}</span></InfoRow>
              <InfoRow label="Total">Rp {Number(report.transaction.gross_amount).toLocaleString("id-ID")}</InfoRow>
              <InfoRow label="Komisi Guide">Rp {Number(report.transaction.guide_commission).toLocaleString("id-ID")}</InfoRow>
              <InfoRow label="Status Transaksi">{report.transaction.status}</InfoRow>
            </div>
          )}

          {/* Deskripsi */}
          <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <AlignLeft size={14} /> Deskripsi Laporan
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
          </div>
        </div>

        {/* ── Kolom Kanan: Aksi Admin ── */}
        <div className="space-y-5">

          {/* Update Status */}
          <div className="rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <RefreshCw size={14} /> Ubah Status Laporan
            </h2>
            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Status Baru</label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as AdminReportUpdate["status"])}
                    className="h-9 w-full rounded-lg border bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="open">Open — Menunggu Tinjauan</option>
                    <option value="in_review">In Review — Sedang Ditinjau</option>
                    <option value="resolved">Resolved — Selesai</option>
                    <option value="dismissed">Dismissed — Ditolak</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Catatan Resolusi <span className="opacity-50">(opsional)</span></label>
                <textarea
                  rows={4} value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Jelaskan hasil tinjauan atau tindakan yang telah diambil..."
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {statusMsg && (
                <p className={cn(
                  "text-sm rounded-lg px-3 py-2",
                  isStatusSuccess
                    ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border border-green-200 dark:border-green-800"
                    : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
                )}>{statusMsg}</p>
              )}

              <Button type="submit" className="w-full" disabled={savingStatus || !newStatus}>
                {savingStatus ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
                {savingStatus ? "Menyimpan..." : "Simpan Status"}
              </Button>
            </form>
          </div>

          {/* Form Email Laporan */}
          <div className="rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <Mail size={14} /> Kirim Email ke Guide
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4">

              {/* Config */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Kirim dari (konfigurasi)</label>
                <div className="relative">
                  <select
                    value={configId}
                    onChange={e => setConfigId(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border bg-background px-3 pr-8 text-sm focus:outline-none appearance-none"
                  >
                    <option value="">— Pilih konfigurasi —</option>
                    {configs.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} &lt;{c.from_address}&gt;{c.is_default ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Kode Laporan — readonly */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Nomor Laporan</label>
                <Input value={report.report_code} readOnly className="font-mono bg-muted/40 cursor-default" />
              </div>

              {/* To — readonly badge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Kepada <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={() => setShowCc(v => !v)}
                    className="text-[11px] text-primary hover:underline">
                    {showCc ? "Sembunyikan CC" : "Tambah CC"}
                  </button>
                </div>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/40 cursor-not-allowed min-h-[2.25rem]">
                  <Mail size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground font-mono">
                    {report.guide_email ?? <span className="text-muted-foreground italic">Email guide tidak tersedia</span>}
                  </span>
                  {report.guide_name && (
                    <span className="text-xs text-muted-foreground ml-1">({report.guide_name})</span>
                  )}
                  <span className="ml-auto text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">Otomatis</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Email penerima otomatis terisi dari akun guide yang mengajukan laporan dan tidak dapat diubah.
                </p>
              </div>

              {/* CC */}
              {showCc && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">CC <span className="opacity-50">(opsional)</span></label>
                  <TagInput value={emailCc} onChange={setEmailCc} placeholder="cc@contoh.com" />
                </div>
              )}

              {/* Subjek */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Subjek</label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subjek email..." />
              </div>

              {/* Body WYSIWYG — area yang bisa diedit admin */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Pesan <span className="text-red-500">*</span></label>
                <div className="rounded-lg border overflow-hidden">
                  <EditorToolbar editor={editor} />
                  <EditorContent
                    editor={editor}
                    className="bg-background [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror-placeholder]:text-muted-foreground [&_.ProseMirror-placeholder]:pointer-events-none"
                  />
                </div>
              </div>

              {/* Footer preview — read-only, selalu terkirim di bawah pesan */}
              <EmailFooterPreview report={report} />

              {emailMsg && (
                <p className={cn(
                  "text-sm rounded-lg px-3 py-2",
                  isEmailSuccess
                    ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border border-green-200 dark:border-green-800"
                    : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
                )}>{emailMsg}</p>
              )}

              <Button type="submit" className="w-full" disabled={sending || !report.guide_email}>
                {sending
                  ? <Loader2 size={14} className="animate-spin mr-1" />
                  : <Send size={14} className="mr-1" />
                }
                {sending ? "Mengirim..." : `Kirim Email ke ${report.guide_email ?? "Guide"}`}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
