import { apiBase } from './api'

export interface UploadResult {
  url: string
  filename: string
}

/**
 * Upload satu file ke backend.
 * Kembalikan URL relatif yang bisa langsung disimpan ke field profil.
 *
 * Contoh:
 *   const { url } = await uploadsService.upload(file)
 *   // url = "/api/v1/uploads/abc123.jpg"
 *   await guidesService.updateProfile({ guide_id_card_url: url })
 */
export const uploadsService = {
  upload: async (file: File): Promise<UploadResult> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null

    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${apiBase}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail ?? 'Upload gagal')
    }

    return res.json() as Promise<UploadResult>
  },

  /**
   * URL lengkap untuk ditampilkan di <img> atau dibuka di tab baru.
   * Karena endpoint butuh auth, tidak bisa langsung pakai di src img — 
   * gunakan untuk admin panel yang sudah login.
   */
  getUrl: (relativeUrl: string): string => {
    if (relativeUrl.startsWith('http')) return relativeUrl
    return `${apiBase}${relativeUrl}`
  },
}
