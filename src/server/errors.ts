import { NextResponse } from 'next/server'
import { logger } from './logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ERROR_CODES = {
  // Generic errors
  NOT_FOUND: 'NOT_FOUND',

  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Wallet errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',

  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  SERVICE_NOT_AVAILABLE: 'SERVICE_NOT_AVAILABLE',
  PURCHASE_FAILED: 'PURCHASE_FAILED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PAYMENT_GATEWAY: 'INVALID_PAYMENT_GATEWAY',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',

  // Provider errors
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  INVALID_PROVIDER_RESPONSE: 'INVALID_PROVIDER_RESPONSE',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    logger.error(`App Error: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
    })
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    logger.error(`Unhandled Error: ${error.message}`, {
      stack: error.stack,
    })
  } else {
    logger.error('Unknown error occurred', { error })
  }

  return NextResponse.json(
    {
      error: {
        message: 'Internal Server Error',
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      },
    },
    { status: 500 }
  )
}

export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `${field} is required`
    }
  }
  return null
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^\+?[\d\s\-()]{7,}$/
  return phoneRegex.test(phone)
}
