import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED = ['/dashboard']

// Routes only for guests (redirect to dashboard if already logged in)
const GUEST_ONLY = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('sm_token')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ],
}
