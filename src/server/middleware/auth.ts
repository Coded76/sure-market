import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/server/security'
import { AppError, ERROR_CODES } from '@/server/errors'
import User from '@/models/User'
import { connectDB } from '@/lib/db'

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return cookies().get('sm_token')?.value ?? null
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const token = getTokenFromRequest(request)
      if (!token) {
        throw new AppError(401, 'No authorization token provided', ERROR_CODES.UNAUTHORIZED)
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        throw new AppError(401, 'Invalid or expired token', ERROR_CODES.TOKEN_EXPIRED)
      }

      // Verify user still exists and is active
      await connectDB()
      const user = await User.findById(decoded.userId)
      if (!user || user.status !== 'active') {
        throw new AppError(401, 'User not found or inactive', ERROR_CODES.USER_NOT_FOUND)
      }

      // Attach user to request
      ;(request as AuthenticatedRequest).user = decoded

      return handler(request as AuthenticatedRequest)
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: { message: error.message, code: error.code } },
          { status: error.statusCode }
        )
      }
      return NextResponse.json(
        {
          error: {
            message: 'Authentication failed',
            code: ERROR_CODES.UNAUTHORIZED,
          },
        },
        { status: 401 }
      )
    }
  }
}

export async function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const token = getTokenFromRequest(request)
      if (!token) {
        throw new AppError(401, 'No authorization token provided', ERROR_CODES.UNAUTHORIZED)
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        throw new AppError(401, 'Invalid or expired token', ERROR_CODES.TOKEN_EXPIRED)
      }

      if (decoded.role !== 'admin') {
        throw new AppError(403, 'Admin access required', ERROR_CODES.UNAUTHORIZED)
      }

      // Verify user still exists and is active
      await connectDB()
      const user = await User.findById(decoded.userId)
      if (!user || user.status !== 'active') {
        throw new AppError(401, 'User not found or inactive', ERROR_CODES.USER_NOT_FOUND)
      }

      // Attach user to request
      ;(request as AuthenticatedRequest).user = decoded

      return handler(request as AuthenticatedRequest)
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: { message: error.message, code: error.code } },
          { status: error.statusCode }
        )
      }
      return NextResponse.json(
        {
          error: {
            message: 'Authentication failed',
            code: ERROR_CODES.UNAUTHORIZED,
          },
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware to verify API key (for server-to-server calls)
 */
export async function withApiKeyAuth(
  handler: (req: NextRequest, apiKeyHash: string) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const apiKey = request.headers.get('x-api-key')
      if (!apiKey) {
        throw new AppError(401, 'No API key provided', ERROR_CODES.UNAUTHORIZED)
      }

      // Hash the provided key and verify
      // (Implementation depends on how you're storing API key hashes)

      return handler(request, apiKey)
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: { message: error.message, code: error.code } },
          { status: error.statusCode }
        )
      }
      return NextResponse.json(
        {
          error: {
            message: 'Authentication failed',
            code: ERROR_CODES.UNAUTHORIZED,
          },
        },
        { status: 401 }
      )
    }
  }
}
