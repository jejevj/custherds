import { API_BASE_URL } from '@/lib/constants'
import { getTokens } from './api'

export interface UploadResult {
  url: string
  filename: string
}

/**
 * Resolve path relatif (/api/v1/uploads/xxx) ke full backend URL.
 * Jika sudah http(s) dikembalikan as-is.
 */
export function resolveUploadUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // API_BASE_URL = https://api-custherds.ourtestcloud.my.id/api/v1
  // strip /api/v1 lalu sambung path relatif
  return `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}${url}`
}

/** Upload single file → return { url (full), filename } */
async function upload(file: File): Promise<UploadResult> {
  const { access } = getTokens()
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: access ? { Authorization: `Bearer ${access}` } : {},
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload gagal' }))
    throw new Error(err.detail ?? 'Upload gagal')
  }

  const data = await res.json() as UploadResult
  return { ...data, url: resolveUploadUrl(data.url) }
}

/** Resolve relative URL — alias untuk backward compat */
const getUrl = resolveUploadUrl

/** Backward-compat object — dipakai GuideStatusGate, AdminGuides, AdminVendors */
export const uploadsService = { upload, getUrl }

/**
 * Upload multiple foto sekaligus ke POST /api/v1/uploads/batch.
 * Return array full URL langsung siap dipakai sebagai <Image src>.
 */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const { access } = getTokens()
  const form = new FormData()
  files.forEach(f => form.append('files', f))

  const res = await fetch(`${API_BASE_URL}/uploads/batch`, {
    method: 'POST',
    headers: access ? { Authorization: `Bearer ${access}` } : {},
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload gagal' }))
    throw new Error(err.detail ?? 'Upload gagal')
  }

  const data = await res.json() as { uploaded: UploadResult[]; count: number }
  // convert semua URL relatif ke full backend URL
  return data.uploaded.map(u => resolveUploadUrl(u.url))
}
