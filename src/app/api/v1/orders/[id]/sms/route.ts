export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = params.id

    // Get SMS
    const sms = await OrderService.getSMS(orderId, decoded.userId)

    logger.info('SMS retrieved successfully', {
      userId: decoded.userId,
      orderId,
    })

    return NextResponse.json({ sms })
  } catch (error) {
    logger.error('SMS retrieval error', { error })
    return handleError(error)
  }
}
