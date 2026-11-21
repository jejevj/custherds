import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getLoginPath, getPortalRole } from '@/lib/auth-routes'

// ─── constants ──────────────────────────────────────────────────────────────
const DASHBOARD_PATHS: Record<number, string> = {
  99: '/admin/dashboard',
  1:  '/guide/dashboard',
  2:  '/vendor/dashboard',
}

/**
 * Baca user_type dari cookie `user_type` yang di-set saat login.
 * Jauh lebih reliable daripada decode Zustand state di cookie custherds-auth
 * karena Zustand baru sync setelah hydration di browser.
 */
function getUserType(request: NextRequest): number | null {
  const raw = request.cookies.get('user_type')?.value
  if (!raw) return null
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) ? null : parsed
}

// ─── middleware ──────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token    = request.cookies.get('access_token')?.value
  const userType = token ? getUserType(request) : null

  // 1. Root "/" — landing page
  if (pathname === '/') {
    if (token && userType !== null) {
      const dest = DASHBOARD_PATHS[userType] ?? '/admin/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // 2. Role root: /admin  /guide  /vendor  (tanpa sub-path)
  const role = getPortalRole(pathname)
  const loginPath = getLoginPath(pathname)
  if (role && loginPath && (pathname === `/${role}` || pathname === `/${role}/`)) {
    const dest = userType !== null ? DASHBOARD_PATHS[userType] ?? loginPath : loginPath
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // 3. Login pages — jika sudah login redirect ke dashboard
  if (loginPath && (pathname === loginPath || pathname === `${loginPath}/`)) {
    if (token && userType !== null) {
      const dest = DASHBOARD_PATHS[userType]
      if (dest) return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // 4. Protected routes — harus ada token
  if (loginPath && !token) {
    return NextResponse.redirect(new URL(loginPath, request.url))
  }

  // 5. Role mismatch guard
  //    Guide/Vendor coba akses /admin/... → redirect ke dashboard mereka
  //    dengan ?reason=unauthorized_role supaya dashboard tampilkan toast
  if (token && userType !== null && role) {
    const expectedTypeEntry = Object.entries(DASHBOARD_PATHS).find(
      ([, v]) => v.startsWith(`/${role}`)
    )
    const expectedType = expectedTypeEntry ? Number(expectedTypeEntry[0]) : null
    if (expectedType !== null && userType !== expectedType) {
      const dest = DASHBOARD_PATHS[userType] ?? '/'
      const url  = new URL(dest, request.url)
      url.searchParams.set('reason', 'unauthorized_role')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.*\.png|.*\.svg).*)'],
}
