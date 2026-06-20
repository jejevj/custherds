/**
 * Base fetch wrapper for Next.js backoffice.
 * Uses native fetch (built into Next.js) with type safety.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>) {
    const url = new URL(`${BASE_URL}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
    }
    return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const res = await fetch(buildUrl(path, params), {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...fetchOptions.headers,
        },
    })

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw errBody
    }

    return res.json() as Promise<T>
}

export const api = {
    get: <T>(path: string, options?: RequestOptions) =>
        request<T>(path, { method: 'GET', ...options }),
    post: <T>(path: string, body: unknown, options?: RequestOptions) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: <T>(path: string, body: unknown, options?: RequestOptions) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
    patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
    delete: <T>(path: string, options?: RequestOptions) =>
        request<T>(path, { method: 'DELETE', ...options }),
}
