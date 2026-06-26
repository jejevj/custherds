import { API_BASE_URL } from '@/lib/constants'
import { getTokens } from './api'

export interface UploadResult {
  url: string
  filename: string
}

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
