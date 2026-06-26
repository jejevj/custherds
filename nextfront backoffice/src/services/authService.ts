import { api, saveTokens } from './api'
import { LoginRequest, LoginResponse, RefreshResponse } from '@/types/auth.types'
import { useAuthStore } from '@/store/auth.store'

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const data = await api.post<LoginResponse>('/auth/login', payload)
  saveTokens(data.access_token, data.refresh_token)
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
  window.location.href = '/login'
}

export const refreshToken = async (): Promise<RefreshResponse> => {
  const refresh = localStorage.getItem('refresh_token')
  return api.post<RefreshResponse>('/auth/refresh', { refresh_token: refresh })
}
