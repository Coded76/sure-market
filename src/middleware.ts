import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that require authentication
const PROTECTED = ['/dashboard']

// Routes only for guests (redirect to dashboard if already logged in)
const GUEST_ONLY = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password']

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret'
)

async function decodeToken(token: string): Promise<{ role?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { role?: string }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('sm_token')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes — only users with role=admin may access
  if (pathname.startsWith('/dashboard/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const decoded = await decodeToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
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
