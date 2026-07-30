"use client"
import { useEffect, useState, useMemo } from "react"
import { adminService, AdminTransaction } from "@/services/admin.service"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X, Info } from "lucide-react"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  settled:                 "default",
  payment_pending:         "secondary",
  payment_failed:          "destructive",
  rejected:                "destructive",
  pending_vendor_approval: "secondary",
}

const STATUS_LABEL: Record<string, string> = {
  settled:                 "Settled",
  payment_pending:         "Menunggu Bayar",
  payment_failed:          "Gagal",
  rejected:                "Ditolak",
  pending_vendor_approval: "Menunggu Vendor",
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

function fmt(n?: string | null) {
  if (n == null || n === "") return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}

function fmtDate(dateStr?: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Detail Modal ───────────────────────────────────────────────────────────
function TransactionDetailModal({
  tx,
  onClose,
}: {
  tx: AdminTransaction
  onClose: () => void
}) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const isRejected = tx.status === "rejected"

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "ID Transaksi",    value: <span className="font-mono text-xs break-all">{tx.id}</span> },
    { label: "Kode Transaksi",  value: <span className="font-mono font-semibold">{tx.transaction_code}</span> },
    { label: "Status",          value: (
        <Badge variant={STATUS_VARIANT[tx.status] ?? "secondary"} className="text-xs">
          {STATUS_LABEL[tx.status] ?? tx.status}
        </Badge>
      )
    },
    { label: "Gross Total",     value: <span className="font-semibold">{fmt(tx.gross_amount)}</span> },
    { label: "Vendor Share",    value: <span className="text-blue-400">{fmt(tx.vendor_amount)}</span> },
    { label: "Komisi Guide",    value: <span className="text-emerald-400">{fmt(tx.guide_commission)}</span> },
    { label: "Fee Platform",    value: <span className="text-amber-400">{fmt(tx.platform_fee)}</span> },
    {
      label: "Metode Bayar",
      value: tx.payment_method === "deposit"       ? "Deposit"
           : tx.payment_method === "pay_as_you_go" ? "QRIS"
           : (tx.payment_method ?? "-"),
    },
    { label: "Dibuat",          value: fmtDate(tx.created_at) },
    { label: "Diperbarui",      value: fmtDate((tx as any).updated_at) },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f1117] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Detail Transaksi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Rejection reason banner */}
        {isRejected && (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-xs font-semibold text-red-400 mb-1">⚠ Alasan Penolakan</p>
            <p className="text-xs text-red-300 leading-relaxed">
              {(tx as any).rejection_reason
                ? (tx as any).rejection_reason
                : "Vendor menolak pesanan ini. Tidak ada catatan alasan spesifik yang disimpan. Silakan hubungi vendor atau periksa log aktivitas untuk informasi lebih lanjut."}
            </p>
          </div>
        )}

        {/* Data rows */}
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground shrink-0 w-36">{label}</span>
              <span className="text-foreground text-right">{value ?? "-"}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminTransactionsPage() {
  const [data,    setData]    = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  const [search,   setSearch]   = useState("")
  const [statusF,  setStatusF]  = useState("")
  const [perPage,  setPerPage]  = useState(25)
  const [page,     setPage]     = useState(1)

  const [selected, setSelected] = useState<AdminTransaction | null>(null)

  useEffect(() => {
    adminService.listTransactions()
      .then(setData)
      .catch(() => setError("Gagal memuat transaksi."))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let d = data
    if (statusF) d = d.filter(t => t.status === statusF)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      d = d.filter(t =>
        t.transaction_code.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      )
    }
    return d
  }, [data, statusF, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage   = Math.min(page, totalPages)
  const slice      = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  const handleSearch  = (v: string) => { setSearch(v);  setPage(1) }
  const handleStatus  = (v: string) => { setStatusF(v); setPage(1) }
  const handlePerPage = (v: number) => { setPerPage(v); setPage(1) }

  const pageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safePage > 3)              pages.push("...")
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
      if (safePage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  const uniqueStatuses = useMemo(() => Array.from(new Set(data.map(t => t.status))), [data])

  return (
    <>
      {selected && (
        <TransactionDetailModal
          tx={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm">Seluruh transaksi di platform.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode / ID..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/15 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/30 w-52 transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex items-center">
                <SlidersHorizontal size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
                <select
                  value={statusF}
                  onChange={e => handleStatus(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/15 text-foreground focus:outline-none focus:ring-1 focus:ring-white/30 appearance-none cursor-pointer transition"
                >
                  <option value="">Semua Status</option>
                  {uniqueStatuses.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                  ))}
                </select>
              </div>

              <select
                value={perPage}
                onChange={e => handlePerPage(Number(e.target.value))}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/15 text-foreground focus:outline-none focus:ring-1 focus:ring-white/30 appearance-none cursor-pointer transition"
              >
                {PER_PAGE_OPTIONS.map(n => (
                  <option key={n} value={n}>{n} baris</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 bg-white/5">
                  {["Kode Transaksi", "Gross Total", "Vendor Share", "Komisi Guide", "Fee Platform", "Metode", "Status", "Tanggal", ""].map((h, idx) => (
                    <th key={idx} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : slice.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground text-sm">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : slice.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                      i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">{t.transaction_code}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground/60 mt-0.5">{t.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{fmt(t.gross_amount)}</td>
                    <td className="px-4 py-3 text-blue-400 whitespace-nowrap">{fmt(t.vendor_amount)}</td>
                    <td className="px-4 py-3 text-emerald-400 whitespace-nowrap">{fmt(t.guide_commission)}</td>
                    <td className="px-4 py-3 text-amber-400 whitespace-nowrap">{fmt(t.platform_fee)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {t.payment_method === "deposit"       ? "Deposit" :
                         t.payment_method === "pay_as_you_go" ? "QRIS"    :
                         t.payment_method ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"} className="text-xs">
                        {STATUS_LABEL[t.status] ?? t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(t)}
                        className="px-3 py-1 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-foreground transition font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 bg-white/5">
            <p className="text-xs text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1}
              </span>
              {" "}–{" "}
              <span className="font-semibold text-foreground">
                {Math.min(safePage * perPage, filtered.length)}
              </span>
              {" "}dari{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>
              {" "}transaksi
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {pageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-xs select-none">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium border transition ${
                      safePage === p
                        ? "bg-white/20 border-white/30 text-foreground shadow-inner"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
