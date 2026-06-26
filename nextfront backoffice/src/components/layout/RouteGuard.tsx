'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

interface RouteGuardProps {
  children: React.ReactNode
  requiredUserType: number
  loginPath: string
}

export default function RouteGuard({ children, requiredUserType, loginPath }: RouteGuardProps) {
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const user        = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isLoggedIn) {
      window.location.href = loginPath
      return
    }
    if (user && user.user_type !== requiredUserType) {
      window.location.href = loginPath
    }
  }, [hasHydrated, isLoggedIn, user, requiredUserType, loginPath])

  if (!hasHydrated) return null
  if (!isLoggedIn)  return null
  if (user && user.user_type !== requiredUserType) return null

  return <>{children}</>
}
