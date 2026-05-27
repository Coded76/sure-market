import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/server/services/WalletService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'

export async function GET(request: NextRequest) {
  try {
    // Extract token from header
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

    const balance = await WalletService.getBalance(decoded.userId)
    return NextResponse.json(balance)
  } catch (error) {
    logger.error('Wallet balance fetch error', { error })
    return handleError(error)
  }
}
