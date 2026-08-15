import { api } from './api'

const LEGACY_API_URL = (
  process.env.NEXT_PUBLIC_LEGACY_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '')

const R2_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_R2_UPLOAD_URL ?? ''
).replace(/\/$/, '')

type UploadResponse = {
  url: string
}

type BatchUploadResponse = {
  urls: string[]
}

/**
 * Resolve upload value to a displayable URL.
 * Absolute URLs (including Cloudflare R2) are used directly.
 * Legacy /api/v1/uploads paths are served by the legacy API host.
 */
export function resolveUploadUrl(value?: string | null): string {
  if (!value) return ''

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const path = value.replace(/^\/+/, '')

  if (value.startsWith('/api/v1/uploads/')) {
    return `${LEGACY_API_URL}${value}`
  }

  if (R2_PUBLIC_URL && (path.startsWith('uploads/') || path.startsWith('r2/'))) {
    return `${R2_PUBLIC_URL}/${path}`
  }

  return `${LEGACY_API_URL}/api/v1/uploads/${path}`
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<UploadResponse>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.url
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const res = await api.post<BatchUploadResponse>('/uploads/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.urls
}

export const uploadsService = {
  getUrl: resolveUploadUrl,
  upload: uploadFile,
  uploadBatch: uploadFiles,
}

export const uploadPhotos = uploadFiles
