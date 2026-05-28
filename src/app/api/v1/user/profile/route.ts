export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'

export async function GET(request: NextRequest) {
  try {
    // Extract token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: { message: 'Invalid token', code: ERROR_CODES.TOKEN_EXPIRED } },
        { status: 401 }
      )
    }

    const user = await UserService.getUserById(decoded.userId)
    return NextResponse.json(user)
  } catch (error) {
    logger.error('Get profile error', { error })
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: { message: 'Invalid token', code: ERROR_CODES.TOKEN_EXPIRED } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updated = await UserService.updateProfile(decoded.userId, body)

    logger.info('Profile updated successfully', {
      userId: decoded.userId,
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Update profile error', { error })
    return handleError(error)
  }
}
