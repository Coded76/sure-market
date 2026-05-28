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

    // Set secure httpOnly cookie so token is never exposed to JS
    const response = NextResponse.json(
      {
        user: result.user,
        token: result.token,
      },
      { status: 200 }
    )

    response.cookies.set('sm_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    logger.info('User logged in successfully', { email })

    return response
  } catch (error) {
    logger.error('Login error', { error })
    return handleError(error)
  }
}
