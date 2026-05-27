import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json()
    const { serviceType, service, country, price } = body

    if (!serviceType || !service || !country || !price) {
      return NextResponse.json(
        {
          error: {
            message: 'Missing required fields',
            code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          },
        },
        { status: 400 }
      )
    }

    // Create order
    const order = await OrderService.createOrder(decoded.userId, {
      serviceType,
      service,
      country,
      price,
      currency: 'USD',
    })

    logger.info('Order created successfully', {
      userId: decoded.userId,
      orderId: order.orderId,
      country,
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    logger.error('Order creation error', { error })
    return handleError(error)
  }
}
