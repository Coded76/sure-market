export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            message: 'Email and password are required',
            code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          },
        },
        { status: 400 }
      )
    }

    const result = await UserService.login(email, password)

    logger.info('User logged in successfully', { email })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Login error', { error })
    return handleError(error)
  }
}
