import AuditLog from '@/models/AuditLog'
import APILog from '@/models/APILog'
import { connectDB } from '@/lib/db'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Console logger with colors
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  green: '\x1b[32m',
}

function formatLog(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString()
  const prefix =
    level === 'error'
      ? colors.red
      : level === 'warn'
        ? colors.yellow
        : level === 'debug'
          ? colors.blue
          : colors.green

  const formatted = `${prefix}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.reset}`
  return data ? `${formatted}\n${JSON.stringify(data, null, 2)}` : formatted
}

export const logger = {
  info: (message: string, data?: any) => {
    console.log(formatLog('info', message, data))
  },
  warn: (message: string, data?: any) => {
    console.warn(formatLog('warn', message, data))
  },
  error: (message: string, data?: any) => {
    console.error(formatLog('error', message, data))
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', message, data))
    }
  },
}

/**
 * Log API request to external service
 */
export async function logAPIRequest(
  service: string,
  endpoint: string,
  method: string,
  options: {
    statusCode?: number
    success: boolean
    requestBody?: Record<string, any>
    responseBody?: Record<string, any>
    errorMessage?: string
    errorStack?: string
    retryCount?: number
    userId?: string
    orderId?: string
    transactionId?: string
    duration: number
    ipAddress?: string
  }
) {
  try {
    await connectDB()
    await APILog.create({
      service,
      endpoint,
      method,
      statusCode: options.statusCode,
      success: options.success,
      requestBody: options.requestBody,
      responseBody: options.responseBody,
      errorMessage: options.errorMessage,
      errorStack: options.errorStack,
      retryCount: options.retryCount || 0,
      userId: options.userId,
      orderId: options.orderId,
      transactionId: options.transactionId,
      duration: options.duration,
      ipAddress: options.ipAddress,
    })
  } catch (error) {
    logger.error('Failed to log API request', { error, service, endpoint })
  }
}

/**
 * Log audit action
 */
export async function logAuditAction(
  action: string,
  resource: string,
  options: {
    userId?: string
    adminId?: string
    resourceId?: string
    changes?: Record<string, any>
    status: 'success' | 'failure'
    errorMessage?: string
    ipAddress?: string
    userAgent?: string
    method: string
    endpoint: string
    statusCode: number
    responseTime: number
    metadata?: Record<string, any>
  }
) {
  try {
    await connectDB()
    await AuditLog.create({
      userId: options.userId,
      adminId: options.adminId,
      action,
      resource,
      resourceId: options.resourceId,
      changes: options.changes,
      status: options.status,
      errorMessage: options.errorMessage,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      method: options.method,
      endpoint: options.endpoint,
      statusCode: options.statusCode,
      responseTime: options.responseTime,
      metadata: options.metadata,
    })
  } catch (error) {
    logger.error('Failed to log audit action', { error, action, resource })
  }
}
