import { NextRequest, NextResponse } from 'next/server'
import { AppError, ERROR_CODES } from '@/server/errors'

// Simple in-memory rate limiter (consider Redis for production)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return function rateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      try {
        // Get client IP
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          'unknown'

        const key = ip
        const now = Date.now()
        let data = rateLimitStore.get(key)

        // Reset if window expired
        if (!data || now > data.resetTime) {
          data = { count: 0, resetTime: now + windowMs }
          rateLimitStore.set(key, data)
        }

        // Check limit
        if (data.count >= maxRequests) {
          const secondsUntilReset = Math.ceil(
            (data.resetTime - now) / 1000
          )
          throw new AppError(
            429,
            `Too many requests. Try again in ${secondsUntilReset} seconds`,
            ERROR_CODES.RATE_LIMIT_EXCEEDED
          )
        }

        data.count++

        const response = await handler(request)
        response.headers.set('X-RateLimit-Limit', String(maxRequests))
        response.headers.set(
          'X-RateLimit-Remaining',
          String(maxRequests - data.count)
        )
        response.headers.set(
          'X-RateLimit-Reset',
          String(data.resetTime)
        )

        return response
      } catch (error) {
        if (error instanceof AppError) {
          const response = NextResponse.json(
            { error: { message: error.message, code: error.code } },
            { status: error.statusCode }
          )
          response.headers.set('X-RateLimit-Limit', String(maxRequests))
          response.headers.set('X-RateLimit-Remaining', '0')
          return response
        }
        throw error
      }
    }
  }
}
