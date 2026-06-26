'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveTokens, clearTokens } from '@/services/api'

export interface AuthUser {
  id: string
  user_name: string
  user_email: string
  user_type: number
  is_active: boolean
}

interface AuthState {
  accessToken:  string | null
  refreshToken: string | null
  user:         AuthUser | null
  isLoggedIn:   boolean
  setTokens: (access: string, refresh: string) => void
  setUser:   (user: AuthUser) => void
  logout:    () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,
      isLoggedIn:   false,

      setTokens: (access, refresh) => {
        saveTokens(access, refresh)
        set({ accessToken: access, refreshToken: refresh, isLoggedIn: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearTokens()
        set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false })
      },
    }),
    {
      name: 'custherds-auth',
      partialize: (state: AuthState) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        user:         state.user,
        isLoggedIn:   state.isLoggedIn,
      }),
    }
  )
)
