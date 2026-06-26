import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── constants ──────────────────────────────────────────────────────────────
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

const PUBLIC_PATHS = Object.values(LOGIN_PATHS)

// ─── helpers ────────────────────────────────────────────────────────────────
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

// ─── middleware ──────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token    = request.cookies.get('access_token')?.value
  const userType = token ? getUserType(request) : null

  // 1. Static assets / api — skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Root "/" → redirect ke dashboard (jika login) atau admin/login
  if (pathname === '/') {
    if (token && userType !== null) {
      const dest = DASHBOARD_PATHS[userType] ?? '/admin/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 3. Role root: /admin  /guide  /vendor  (tanpa trailing path)
  //    → redirect ke dashboard atau login role tersebut
  const roleRootMatch = pathname.match(/^\/([a-z]+)\/?$/)
  if (roleRootMatch) {
    const role = roleRootMatch[1]
    if (role in LOGIN_PATHS) {
      if (token) {
        const dest = userType !== null
          ? DASHBOARD_PATHS[userType] ?? `/${role}/login`
          : `/${role}/login`
        return NextResponse.redirect(new URL(dest, request.url))
      }
      return NextResponse.redirect(new URL(`/${role}/login`, request.url))
    }
  }

  // 4. Public login pages — always allow
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Jika sudah login dan buka halaman login → redirect ke dashboard
    if (token && userType !== null) {
      const dest = DASHBOARD_PATHS[userType]
      if (dest) return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // 5. Protected routes — harus ada token
  const role = getRole(pathname)
  if (role && !token) {
    return NextResponse.redirect(new URL(LOGIN_PATHS[role]!, request.url))
  }

  // 6. Role mismatch guard
  //    (admin login tapi akses /guide/...) → redirect ke dash yang benar
  if (token && userType !== null && role) {
    const correctDash = DASHBOARD_PATHS[userType]
    const correctRole = Object.entries(DASHBOARD_PATHS).find(
      ([, v]) => v.startsWith(`/${role}`)
    )
    const expectedType = correctRole ? Number(correctRole[0]) : null
    if (expectedType !== null && userType !== expectedType) {
      return NextResponse.redirect(new URL(correctDash ?? '/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.*\.png|.*\.svg).*)'],
}
