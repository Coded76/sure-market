export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError, AppError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, country } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
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

    const result = await UserService.register({
      email,
      password,
      firstName,
      lastName,
      country,
    })

    logger.info('User registered successfully', { email })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    logger.error('Registration error', { error })
    return handleError(error)
  }
}
