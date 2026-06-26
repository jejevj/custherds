import { API_BASE_URL } from '@/lib/constants'
import { getTokens } from './api'

export interface UploadResult {
  url: string
  filename: string
}

/** Upload single file → return { url, filename } */
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

  return res.json() as Promise<UploadResult>
}

/** Resolve relative URL (/api/v1/uploads/xxx) ke full URL jika perlu */
function getUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL.replace('/api/v1', '')}${url}`
}

/**
 * Backward-compat object — dipakai oleh GuideStatusGate, AdminGuidesContent,
 * AdminVendorsContent, dll.
 */
export const uploadsService = { upload, getUrl }

/**
 * Upload multiple foto sekaligus ke POST /api/v1/uploads/multiple
 * Return array URL yang bisa langsung disimpan ke photo_urls
 */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const { access } = getTokens()
  const form = new FormData()
  files.forEach(f => form.append('files', f))

  const res = await fetch(`${API_BASE_URL}/uploads/multiple`, {
    method: 'POST',
    headers: access ? { Authorization: `Bearer ${access}` } : {},
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload gagal' }))
    throw new Error(err.detail ?? 'Upload gagal')
  }

  const data = await res.json() as { uploaded: UploadResult[]; count: number }
  return data.uploaded.map(u => u.url)
}
