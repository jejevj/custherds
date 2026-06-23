"use client"

import { useState, useEffect, useRef } from "react"
import { X, CreditCard, CheckCircle2 } from "lucide-react"

interface SimulatePaymentModalProps {
  open: boolean
  onClose: () => void
}

type Step = "form" | "loading" | "redirecting"

const PAYMENT_METHODS = [
  { id: "bca",    label: "BCA Virtual Account" },
  { id: "mandiri", label: "Mandiri Virtual Account" },
  { id: "bni",    label: "BNI Virtual Account" },
  { id: "gopay",  label: "GoPay" },
  { id: "ovo",    label: "OVO" },
  { id: "qris",   label: "QRIS" },
]

export function SimulatePaymentModal({ open, onClose }: SimulatePaymentModalProps) {
  const [step, setStep]           = useState<Step>("form")
  const [nominal, setNominal]     = useState("")
  const [description, setDescription] = useState("")
  const [method, setMethod]       = useState("bca")
  const [countdown, setCountdown] = useState(3)
  const [error, setError]         = useState("")
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep("form")
      setNominal("")
      setDescription("")
      setMethod("bca")
      setCountdown(3)
      setError("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Countdown logic
  useEffect(() => {
    if (step === "redirecting") {
      setCountdown(3)
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            // In a real scenario: router.push('/admin/payments')
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
  }, [step, onClose])

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && step === "form") onClose()
  }

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && step === "form") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [step, onClose])

  function formatCurrency(val: string) {
    const digits = val.replace(/\D/g, "")
    return digits ? Number(digits).toLocaleString("id-ID") : ""
  }

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    const raw = e.target.value.replace(/\D/g, "")
    setNominal(raw)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nominal || Number(nominal) < 1000) {
      setError("Nominal minimum Rp 1.000")
      return
    }
    setError("")
    setStep("loading")
    // Simulate payment processing delay (2s)
    setTimeout(() => setStep("redirecting"), 2000)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl bg-background border shadow-2xl"
        style={{ animation: "fadeSlideUp 0.22s ease" }}
      >
        {/* Header */}
        {step === "form" && (
          <>
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight">Simulate Payment</h2>
                  <p className="text-xs text-muted-foreground">Isi detail transaksi simulasi</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nominal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="nominal">
                  Nominal Pembayaran
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    Rp
                  </span>
                  <input
                    ref={inputRef}
                    id="nominal"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatCurrency(nominal)}
                    onChange={handleNominalChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                      error ? "border-destructive" : "border-input"
                    }`}
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                {/* Quick amount buttons */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {["50000","100000","250000","500000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setNominal(amt); setError("") }}
                      className="text-xs px-2.5 py-1 rounded-full border border-input hover:bg-muted transition-colors"
                    >
                      Rp {Number(amt).toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="method">
                  Metode Pembayaran
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="description">
                  Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="misal: Tour Package - Bali 3D2N"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  maxLength={100}
                />
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
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create Payment
                </button>
              </div>
            </form>
          </>
        )}

        {/* Loading State */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
            {/* Circular Spinner */}
            <div className="relative h-16 w-16">
              <svg
                className="animate-spin h-16 w-16 text-primary"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="32" cy="32" r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeOpacity="0.2"
                />
                <path
                  d="M60 32c0-15.464-12.536-28-28-28"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">Memproses Pembayaran</p>
              <p className="text-sm text-muted-foreground">Harap tunggu sebentar...</p>
            </div>
          </div>
        )}

        {/* Redirecting State */}
        {step === "redirecting" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
            {/* Success icon with pulse */}
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="font-semibold text-base">Pembayaran Berhasil Dibuat!</p>
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
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
            </div>
            {/* Mini progress bar */}
            <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${((3 - countdown) / 3) * 100}%`,
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes countPop {
          0%   { transform: scale(1.6); opacity: 0; }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
