"use client"

import { useState, useEffect, useRef } from "react"
import { X, CreditCard, CheckCircle2, AlertCircle } from "lucide-react"
import { createInvoice, type InvoiceResponse } from "@/services/paymentService"

interface SimulatePaymentModalProps {
  open: boolean
  onClose: () => void
}

type Step = "form" | "loading" | "redirecting" | "error"

export function SimulatePaymentModal({ open, onClose }: SimulatePaymentModalProps) {
  const [step, setStep]           = useState<Step>("form")
  const [nominal, setNominal]     = useState("")
  const [email, setEmail]         = useState("")
  const [description, setDescription] = useState("")
  const [countdown, setCountdown] = useState(3)
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse | null>(null)
  const [apiError, setApiError]   = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep("form")
      setNominal("")
      setEmail("")
      setDescription("")
      setCountdown(3)
      setInvoiceData(null)
      setApiError("")
      setFieldErrors({})
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Countdown + redirect to invoice_url
  useEffect(() => {
    if (step === "redirecting" && invoiceData?.invoice_url) {
      setCountdown(3)
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            window.open(invoiceData.invoice_url, "_blank", "noopener,noreferrer")
            onClose()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [step, invoiceData, onClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && (step === "form" || step === "error")) onClose()
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && (step === "form" || step === "error")) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [step, onClose])

  function formatRp(val: string) {
    const digits = val.replace(/\D/g, "")
    return digits ? Number(digits).toLocaleString("id-ID") : ""
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!nominal || Number(nominal) < 1000) {
      errors.nominal = "Nominal minimum Rp 1.000"
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email tidak valid"
    }
    if (!description.trim()) {
      errors.description = "Deskripsi wajib diisi"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStep("loading")
    setApiError("")

    try {
      const result = await createInvoice({
        amount: Number(nominal),
        payer_email: email,
        description: description.trim(),
        currency: "IDR",
      })
      setInvoiceData(result)
      setStep("redirecting")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi"
      setApiError(msg)
      setStep("error")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl bg-background border shadow-2xl overflow-hidden"
        style={{ animation: "fadeSlideUp 0.22s ease" }}
      >
        {/* ── FORM STEP ── */}
        {step === "form" && (
          <>
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight">Simulate Payment</h2>
                  <p className="text-xs text-muted-foreground">Buat invoice Xendit untuk simulasi pembayaran</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nominal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="nominal">Nominal Pembayaran</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                  <input
                    ref={inputRef}
                    id="nominal"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatRp(nominal)}
                    onChange={(e) => {
                      setNominal(e.target.value.replace(/\D/g, ""))
                      setFieldErrors((p) => ({ ...p, nominal: "" }))
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                      fieldErrors.nominal ? "border-destructive" : "border-input"
                    }`}
                  />
                </div>
                {fieldErrors.nominal && <p className="text-xs text-destructive">{fieldErrors.nominal}</p>}
                <div className="flex flex-wrap gap-2">
                  {["15000","50000","100000","250000","500000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setNominal(amt); setFieldErrors((p) => ({ ...p, nominal: "" })) }}
                      className="text-xs px-2.5 py-1 rounded-full border border-input hover:bg-muted transition-colors"
                    >
                      Rp {Number(amt).toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Payer */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email Pembayar</label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((p) => ({ ...p, email: "" }))
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                    fieldErrors.email ? "border-destructive" : "border-input"
                  }`}
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="description">Deskripsi Pembayaran</label>
                <input
                  id="description"
                  type="text"
                  placeholder="misal: Tour Package - Bali 3D2N"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setFieldErrors((p) => ({ ...p, description: "" }))
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                    fieldErrors.description ? "border-destructive" : "border-input"
                  }`}
                  maxLength={100}
                />
                {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Create Payment
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── LOADING STEP ── */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
            <div className="relative h-16 w-16">
              <svg
                className="animate-spin h-16 w-16 text-primary"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" strokeOpacity="0.2" />
                <path d="M60 32c0-15.464-12.536-28-28-28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">Membuat Invoice...</p>
              <p className="text-sm text-muted-foreground">Menghubungi Xendit, harap tunggu</p>
            </div>
          </div>
        )}

        {/* ── REDIRECTING STEP ── */}
        {step === "redirecting" && invoiceData && (
          <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold text-base">Invoice Berhasil Dibuat!</p>
              <p className="text-sm text-muted-foreground">Kamu akan diarahkan ke halaman pembayaran Xendit</p>
            </div>

            {/* Invoice detail card */}
            <div className="w-full rounded-xl border bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-mono text-xs font-medium">{invoiceData.invoice_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-semibold">Rp {invoiceData.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mata Uang</span>
                <span>{invoiceData.currency}</span>
              </div>
              {invoiceData.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kadaluarsa</span>
                  <span className="text-xs">{new Date(invoiceData.expiry_date).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Redirecting in</span>
              <span
                key={countdown}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm"
                style={{ animation: "countPop 0.4s ease" }}
              >
                {countdown}
              </span>
              <span>seconds...</span>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${((3 - countdown) / 3) * 100}%`, transition: "width 1s linear" }}
              />
            </div>

            {/* Manual open link */}
            <a
              href={invoiceData.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Klik di sini jika tidak otomatis redirect
            </a>
          </div>
        )}

        {/* ── ERROR STEP ── */}
        {step === "error" && (
          <>
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight">Pembayaran Gagal</h2>
                  <p className="text-xs text-muted-foreground">Terjadi kesalahan saat membuat invoice</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes countPop {
          0%   { transform: scale(1.6); opacity: 0; }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
