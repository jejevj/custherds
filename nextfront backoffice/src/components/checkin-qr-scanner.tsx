"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

export function CheckinQRScanner({ onScan }: { onScan: (bookingCode: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onScanRef = useRef(onScan)
  const [message, setMessage] = useState("Membuka kamera…")

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    const video = videoRef.current!
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { willReadFrequently: true })
    let stream: MediaStream | undefined
    let timer: ReturnType<typeof setTimeout>
    let cancelled = false

    function stop() {
      clearTimeout(timer)
      stream?.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }

    function scan() {
      if (cancelled) return
      if (context && video.readyState >= 2 && video.videoWidth) {
        canvas.width = Math.min(video.videoWidth, 800)
        canvas.height = Math.round(video.videoHeight * canvas.width / video.videoWidth)
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frame = context.getImageData(0, 0, canvas.width, canvas.height)
        const qr = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })
        if (qr && /^BK[0-9]{8}$/.test(qr.data)) {
          stop()
          onScanRef.current(qr.data)
          return
        }
        if (qr) setMessage("Tunjukkan QR check-in dari halaman booking guide.")
      }
      timer = setTimeout(scan, 150)
    }

    async function start() {
      if (!context || !navigator.mediaDevices?.getUserMedia) {
        setMessage("Kamera tidak tersedia. Buka situs melalui HTTPS di browser yang mendukung kamera.")
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        video.srcObject = stream
        await video.play()
        if (!cancelled) {
          setMessage("Arahkan kamera ke QR check-in guide.")
          scan()
        }
      } catch {
        if (!cancelled) {
          stop()
          setMessage("Kamera tidak dapat dibuka. Cek izin kamera, lalu tutup dan buka kembali pemindai.")
        }
      }
    }

    void start()
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return (
    <div className="space-y-2">
      <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-lg bg-black object-contain" aria-label="Pratinjau kamera pemindai QR" />
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
