'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const user        = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    // Tunggu hydration selesai dulu
    if (!hasHydrated) return

    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    if (user && user.user_type !== 99) {
      window.location.href = '/login'
    }
  }, [hasHydrated, isLoggedIn, user])

  // Jangan render apapun sebelum hydration selesai
  if (!hasHydrated) return null
  if (!isLoggedIn)  return null

  return <>{children}</>
}
