import { API_BASE_URL } from '@/lib/constants'
import { saveTokens } from './api'
import { useAuthStore } from '@/store/auth.store'

export interface LoginRequest {
  user_email: string
  user_password: string
}

export interface LoginResponse {
  access_token:  string
  refresh_token: string
  token_type:    string
  user_id:       string
  user_name:     string
  user_email:    string
  user_type:     number
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const body = new URLSearchParams()
  body.append('username', payload.user_email)
  body.append('password', payload.user_password)

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login gagal' }))
    throw err
  }

  const data: LoginResponse = await res.json()

  // Simpan token + user_type ke cookie agar middleware bisa baca role
  saveTokens(data.access_token, data.refresh_token, data.user_type)

  useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
  useAuthStore.getState().setUser({
    id:         data.user_id,
    user_name:  data.user_name,
    user_email: data.user_email,
    user_type:  data.user_type,
    is_active:  true,
  })
  return data
}

export const logout = () => {
  useAuthStore.getState().logout()
  if (typeof window !== 'undefined') window.location.href = '/'
}

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token')
  const body = new URLSearchParams()
  if (refresh) body.append('refresh_token', refresh)

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Refresh failed')
  return res.json()
}
