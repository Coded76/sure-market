import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    
    if (!email || !code) {
      return NextResponse.json(
        {
          error: {
            message: 'Email and code are required',
            code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          },
        },
        { status: 400 }
      )
    }

    await UserService.verifyEmailWithCode(email, code)

    logger.info('Email verified successfully', { email })

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Email verification error', { error })
    return handleError(error)
  }
}
