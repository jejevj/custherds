"use client"
import { useEffect, useRef, useState } from "react"
import { guidesService, GuideProfile } from "@/services/guides.service"
import { uploadsService } from "@/services/uploads.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText, Loader2, Upload, XCircle } from "lucide-react"

type UploadFieldProps = {
  label: string
  value?: string | null
  accept?: string
  onUploaded: (url: string) => void
}

function UploadField({ label, value, accept = "image/*,.pdf", onUploaded }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState("")

  const handleFile = async (file?: File) => {
    if (!file) return
    setErr("")
    setUploading(true)
    try {
      const url = await uploadsService.upload(file)
      onUploaded(url)
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Upload gagal")
    } finally {
      setUploading(false)
    }
  }

  const currentUrl = value ? uploadsService.getUrl(value) : ""

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {value ? "Ganti file" : "Upload file"}
        </Button>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline text-muted-foreground whitespace-nowrap"
          >
            Lihat file
          </a>
        )}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  )
}

export function GuideStatusGate({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<GuideProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    guidesService
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  if (!profile) return <>{children}</>

  if (profile.status === "approved") return <>{children}</>

  const isPending = profile.status === "pending"
  const isRejected = profile.status === "rejected"

  const submit = async () => {
    setSubmitting(true)
    setMessage("")
    try {
      const updated = await guidesService.submitReview({
        ktp_file: profile.ktp_file || undefined,
        certificate_file: profile.certificate_file || undefined,
      })
      setProfile(updated)
      setMessage("Dokumen berhasil dikirim untuk ditinjau.")
    } catch (ex: unknown) {
      setMessage(ex instanceof Error ? ex.message : "Gagal mengirim dokumen")
    } finally {
      setSubmitting(false)
    }
  }

  const updateFile = (field: "ktp_file" | "certificate_file", url: string) => {
    setProfile((current) => current ? { ...current, [field]: url } : current)
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center px-4 py-10">
      <section className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          {isPending ? <Clock className="mt-0.5 h-6 w-6 text-amber-500" /> : isRejected ? <XCircle className="mt-0.5 h-6 w-6 text-destructive" /> : <FileText className="mt-0.5 h-6 w-6 text-primary" />}
          <div>
            <h1 className="text-xl font-semibold">Verifikasi pemandu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload KTP dan, bila ada, sertifikat pemandu sebelum menerima pesanan.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Badge variant={isPending ? "secondary" : isRejected ? "destructive" : "outline"}>
            {isPending ? "Menunggu verifikasi" : isRejected ? "Perlu perbaikan" : "Belum diajukan"}
          </Badge>
          {profile.admin_notes && <p className="mt-2 text-sm text-muted-foreground">Catatan admin: {profile.admin_notes}</p>}
        </div>

        {!isPending && (
          <div className="space-y-5">
            <UploadField
              label="KTP"
              value={profile.ktp_file}
              onUploaded={(url) => updateFile("ktp_file", url)}
            />
            <UploadField
              label="Sertifikat pemandu (opsional)"
              value={profile.certificate_file}
              onUploaded={(url) => updateFile("certificate_file", url)}
            />
            <Button
              type="button"
              className="w-full"
              disabled={submitting || !profile.ktp_file}
              onClick={submit}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Kirim untuk verifikasi
            </Button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </section>
    </main>
  )
}

export default GuideStatusGate
