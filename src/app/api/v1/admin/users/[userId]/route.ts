import { NextRequest, NextResponse } from 'next/server'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import { UserService } from '@/server/services/UserService'
import { WalletService } from '@/server/services/WalletService'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Admin access required', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { action, reason } = body

    if (!action) {
      return NextResponse.json(
        {
          error: {
            message: 'Action is required',
            code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          },
        },
        { status: 400 }
      )
    }

    const userId = params.userId

    // Handle different actions
    switch (action) {
      case 'suspend':
        await UserService.suspendUser(userId, reason)
        logger.info('User suspended', {
          adminId: decoded.userId,
          userId,
          reason,
        })
        break

      case 'activate':
        await UserService.activateUser(userId)
        logger.info('User activated', {
          adminId: decoded.userId,
          userId,
        })
        break

      case 'refund':
        const { amount } = body
        if (!amount) {
          return NextResponse.json(
            {
              error: {
                message: 'Amount is required for refund',
                code: ERROR_CODES.MISSING_REQUIRED_FIELD,
              },
            },
            { status: 400 }
          )
        }
        await WalletService.adminRefund(userId, amount, reason || 'Admin refund')
        logger.info('User refunded', {
          adminId: decoded.userId,
          userId,
          amount,
        })
        break

      default:
        return NextResponse.json(
          {
            error: {
              message: 'Invalid action',
              code: ERROR_CODES.VALIDATION_ERROR,
            },
          },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    logger.error('Admin user action error', { error })
    return handleError(error)
  }
}
