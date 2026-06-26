/**
 * Custherds API Client
 * Native fetch wrapper dengan auto-refresh token support.
 */

import { API_BASE_URL } from '@/lib/constants'

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const url = new URL(base)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null }
  return {
    access:  localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

function saveTokens(access: string, refresh?: string) {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
  // Set cookie supaya middleware (SSR) bisa baca token
  document.cookie = `access_token=${access}; path=/; SameSite=Lax`
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  // Hapus cookie juga
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens()
  if (!refresh) return null
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newAccess: string = data.access_token
    saveTokens(newAccess)
    return newAccess
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { params, ...fetchOptions } = options
  const { access } = getTokens()

  const res = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...fetchOptions.headers,
    },
  })

  // Token expired — coba refresh sekali
  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      return request<T>(path, options, false)
    } else {
      clearTokens()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw errBody
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),
  post:   <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put:    <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch:  <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
}

export { saveTokens, clearTokens, getTokens }
