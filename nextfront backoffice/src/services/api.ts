/**
 * Custherds API Client
 * Native fetch wrapper dengan auto-refresh token support.
 */

import { API_BASE_URL } from '@/lib/constants'
import { getLoginPath } from '@/lib/auth-routes'
import { getTokens } from '@/lib/auth-tokens'
import { useAuthStore } from '@/store/auth.store'

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  let base: string
  if (path.startsWith('http')) {
    base = path
  } else {
    base = `${API_BASE_URL}${path}`
  }

  // If base is an absolute URL, use URL constructor
  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      const url = new URL(base)
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
        })
      }
      return url.toString()
    } catch (err) {
      // Fallback to manual building if URL constructor fails for some reason
      // (shouldn't happen for valid http/https URLs)
      let url = base
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) searchParams.append(k, String(v))
        })
        const queryString = searchParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }
      return url
    }
  } else {
    // base is relative (to current origin)
    let url = base
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v))
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return url
  }
}

let pendingRefresh: { token: string; promise: Promise<string | null> } | undefined

async function refreshAccessToken(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return null
    const { access_token: access } = await res.json()
    return typeof access === 'string' && access ? access : null
  } catch {
    return null
  }
}

function endSession() {
  const loginPath = getLoginPath(window.location.pathname) ?? '/'
  useAuthStore.getState().logout()
  window.location.replace(loginPath)
}

export async function recoverSession(rejectedAccess: string | null): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const { access, refresh } = getTokens()
  if (access !== rejectedAccess) return access
  if (!refresh) {
    endSession()
    return null
  }

  if (pendingRefresh?.token !== refresh) {
    const promise = refreshAccessToken(refresh).finally(() => {
      if (pendingRefresh?.promise === promise) pendingRefresh = undefined
    })
    pendingRefresh = { token: refresh, promise }
  }
  const newAccess = await pendingRefresh.promise

  const current = getTokens()
  if (current.refresh !== refresh || current.access !== rejectedAccess) {
    return current.access
  }
  if (!newAccess) {
    endSession()
    return null
  }

  useAuthStore.getState().setTokens(newAccess, refresh)
  return newAccess
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

  if (res.status === 401 && typeof window !== 'undefined') {
    if (retry && await recoverSession(access)) {
      return request<T>(path, options, false)
    }
    if (!retry && getTokens().access === access) endSession()
    throw new Error('Session expired')
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

export { clearTokens, getTokens, saveTokens } from '@/lib/auth-tokens'
