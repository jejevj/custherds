"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { api } from "@/services/api"

interface PaymentStatusResponse {
  tx_id: string
  status: string
  paid_at: string | null
  settled_at: string | null
  qris_string: string | null
}

interface Props {
  txId: string
  qrisString: string
  amount: number
  onPaid: () => void
  onClose: () => void
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)
}

function buildQrUrl(text: string) {
  // quickchart.io QR — gratis, no API key, no npm install
  return `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=260&margin=2&ecLevel=M`
}

export default function QrisPaymentModal({ txId, qrisString, amount, onPaid, onClose }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [status, setStatus]       = useState<"pending" | "paid" | "failed">("pending")
  const [countdown, setCountdown] = useState(30 * 60) // 30 menit
  const [lastCheck, setLastCheck] = useState<string>("")

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setStatus("failed"); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Polling tiap 5 detik
  const checkStatus = useCallback(async () => {
    try {
      const data = await api.get<PaymentStatusResponse>(`/transactions/${txId}/payment-status`)
      setLastCheck(new Date().toLocaleTimeString("id-ID"))
      if (data.status === "settled") {
        setStatus("paid")
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeout(onPaid, 2000)
      } else if (data.status === "payment_failed") {
        setStatus("failed")
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } catch (err) {
      console.error("[QrisModal] polling error", err)
    }
  }, [txId, onPaid])

  useEffect(() => {
    checkStatus()
    intervalRef.current = setInterval(checkStatus, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [checkStatus])

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0")
  const ss = String(countdown % 60).padStart(2, "0")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Bayar via QRIS</h2>
            <p className="text-amber-100 text-sm">{formatRupiah(amount)}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none" aria-label="Tutup">
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {status === "pending" && (
            <>
              {/* QR Code via quickchart.io — no npm install needed */}
              <div className="rounded-xl border-2 border-amber-200 p-2 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildQrUrl(qrisString)}
                  alt="QRIS Code"
                  width={260}
                  height={260}
                  className="block"
                />
              </div>

              {/* Countdown */}
              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-1">Berlaku selama</p>
                <p className="font-mono text-2xl font-bold text-amber-500">{mm}:{ss}</p>
              </div>

              {/* Status polling */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Menunggu pembayaran…
                {lastCheck && <span className="ml-1 opacity-60">({lastCheck})</span>}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Scan QR menggunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS.
                Status akan otomatis terupdate.
              </p>
            </>
          )}

          {status === "paid" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
              <p className="font-bold text-green-400 text-xl">Pembayaran Berhasil!</p>
              <p className="text-muted-foreground text-sm text-center">
                Transaksi telah diselesaikan. Halaman akan diperbarui…
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-4xl">✗</span>
              </div>
              <p className="font-bold text-red-400 text-xl">QRIS Kadaluarsa</p>
              <p className="text-muted-foreground text-sm text-center">
                Waktu pembayaran habis atau gagal. Silakan coba lagi.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
