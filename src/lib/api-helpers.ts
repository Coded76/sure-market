import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/server/security'

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Fall back to cookie
  return cookies().get('sm_token')?.value ?? null
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  const decoded = verifyToken(token)
  return decoded?.userId ?? null
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

export function requireToken(req: NextRequest): string | NextResponse {
  const token = getTokenFromRequest(req)
  if (!token) return apiError('Unauthorized', 401)
  return token
}
