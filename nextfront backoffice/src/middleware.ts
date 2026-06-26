import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── constants ────────────────────────────────────────────────────────────────
const LOGIN_PATHS: Record<string, string> = {
  admin:  '/admin/login',
  guide:  '/guide/login',
  vendor: '/vendor/login',
}

const DASHBOARD_PATHS: Record<number, string> = {
  99: '/admin/dashboard',
  1:  '/guide/dashboard',
  2:  '/vendor/dashboard',
}

const PUBLIC_PATHS = [
  '/admin/login',
  '/guide/login',
  '/vendor/login',
]

// ─── helpers ──────────────────────────────────────────────────────────────────
function getRole(pathname: string): string | null {
  if (pathname.startsWith('/admin'))  return 'admin'
  if (pathname.startsWith('/guide'))  return 'guide'
  if (pathname.startsWith('/vendor')) return 'vendor'
  return null
}

function getUserType(request: NextRequest): number | null {
  try {
    const raw = request.cookies.get('custherds-auth')?.value
    if (!raw) return null
    const parsed = JSON.parse(decodeURIComponent(raw))
    const userType = parsed?.state?.user?.user_type
    return typeof userType === 'number' ? userType : null
  } catch {
    return null
  }
}

// ─── middleware ───────────────────────────────────────────────────────────────
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
  const roleRootMatch = pathname.match(/^\/([a-z]+)\/?$/)
  if (roleRootMatch) {
    const role = roleRootMatch[1]
    if (role in LOGIN_PATHS) {
      if (token && userType !== null) {
        return NextResponse.redirect(
          new URL(DASHBOARD_PATHS[userType] ?? `/${role}/login`, request.url)
        )
      }
      return NextResponse.redirect(new URL(`/${role}/login`, request.url))
    }
  }

  // 3. Login pages — allow; redirect to dashboard if already logged in
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token && userType !== null) {
      const dest = DASHBOARD_PATHS[userType]
      if (dest) return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // 4. Protected routes — must have token
  const role = getRole(pathname)
  if (role && !token) {
    return NextResponse.redirect(new URL(LOGIN_PATHS[role]!, request.url))
  }

  // 5. Role mismatch guard
  //    Guide/Vendor trying to access /admin/... → redirect to their dashboard
  //    with ?reason=unauthorized_role so the dashboard can show a toast
  if (token && userType !== null && role) {
    const expectedTypeEntry = Object.entries(DASHBOARD_PATHS).find(
      ([, v]) => v.startsWith(`/${role}`)
    )
    const expectedType = expectedTypeEntry ? Number(expectedTypeEntry[0]) : null
    if (expectedType !== null && userType !== expectedType) {
      const dest = DASHBOARD_PATHS[userType] ?? '/admin/login'
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
