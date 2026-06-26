'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router    = useRouter()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user      = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    if (user && user.user_type !== 99) {
      router.replace('/login')
    }
  }, [isLoggedIn, user, router])

  if (!isLoggedIn) return null

  return <>{children}</>
}
