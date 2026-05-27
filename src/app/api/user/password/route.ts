import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Both passwords are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters' }, { status: 400 })
    }

    await UserService.changePassword(userId, currentPassword, newPassword)
    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Password change failed' }, { status: err.statusCode || 500 })
  }
}
