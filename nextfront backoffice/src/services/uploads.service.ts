import { API_BASE_URL } from '@/lib/constants'
import { getTokens } from './api'

export interface UploadResult {
  url: string
  filename: string
}

/**
 * Upload satu file ke backend.
 * POST /uploads  (API_BASE_URL sudah include /api/v1)
 */
export const uploadsService = {
  upload: async (file: File): Promise<UploadResult> => {
    const { access } = getTokens()

    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: access ? { Authorization: `Bearer ${access}` } : {},
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { detail?: string })?.detail ?? 'Upload gagal')
    }

    return res.json() as Promise<UploadResult>
  },

  /**
   * Kembalikan URL lengkap yang bisa dipakai untuk fetch dengan auth.
   * relativeUrl bisa berupa:
   *   - "/api/v1/uploads/xxx.jpg"  -> sudah absolute path, strip prefix dulu
   *   - "/uploads/xxx.jpg"         -> langsung concat
   *   - "https://..."              -> kembalikan apa adanya
   */
  getUrl: (relativeUrl: string): string => {
    if (!relativeUrl) return ''
    if (relativeUrl.startsWith('http')) return relativeUrl
    // Normalise: hapus /api/v1 di depan kalau ada (karena API_BASE_URL sudah include itu)
    const normalised = relativeUrl.replace(/^\/api\/v1/, '')
    return `${API_BASE_URL}${normalised}`
  },
}
