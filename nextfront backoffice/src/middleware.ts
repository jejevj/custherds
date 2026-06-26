import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/admin/login', '/guide/login', '/vendor/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Izinkan semua public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protected routes
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/guide/dashboard') ||
    pathname.startsWith('/vendor/dashboard')

  if (isProtected && !token) {
    if (pathname.startsWith('/guide/')) {
      return NextResponse.redirect(new URL('/guide/login', request.url))
    }
    if (pathname.startsWith('/vendor/')) {
      return NextResponse.redirect(new URL('/vendor/login', request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect root
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
