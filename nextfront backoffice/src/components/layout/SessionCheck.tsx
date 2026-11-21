"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getTokens } from '@/lib/auth-tokens'
import { recoverSession } from '@/services/api'

// The access cookie can still exist after the JWT expires.
function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' && exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

export default function SessionCheck() {
  const pathname = usePathname()

  useEffect(() => {
    const { access } = getTokens()
    if (!access || isExpired(access)) void recoverSession(access)
  }, [pathname])

  return null
}
