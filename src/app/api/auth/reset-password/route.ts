export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError } from '@/server/errors'

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      )
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await UserService.resetPassword(token, newPassword)
    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
