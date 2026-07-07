export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

function mapUser(u: any) {
  return {
    id: String(u.id),
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    country: u.country || 'Nigeria',
    emailVerified: u.emailVerified,
    twoFactorEnabled: false,
    role: u.role,
    createdAt: u.createdAt,
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const user = await UserService.getUserById(userId)
    return NextResponse.json(mapUser(user), { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch profile' }, { status: err.statusCode || 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const updated = await UserService.updateProfile(userId, body)
    return NextResponse.json(mapUser(updated), { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Update failed' }, { status: err.statusCode || 400 })
  }
}
