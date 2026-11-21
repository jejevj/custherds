export function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null }
  return {
    access:  localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

/**
 * Simpan token + user_type ke cookie agar middleware Next.js
 * bisa membaca role tanpa decode JWT.
 */
export function saveTokens(access: string, refresh?: string, userType?: number) {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
  // Cookie dibaca oleh middleware di server-side
  document.cookie = `access_token=${access}; path=/; SameSite=Lax`
  if (userType !== undefined) {
    document.cookie = `user_type=${userType}; path=/; SameSite=Lax`
  }
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
