import bcryptjs from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret'
const JWT_EXPIRATION = (process.env.JWT_EXPIRATION || '7d') as SignOptions['expiresIn']

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: {
  userId: string
  email: string
  role: string
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(
  token: string
): { userId: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch {
    return null
  }
}

/**
 * Generate random token (for email verification, password reset, etc.)
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data (API keys, etc.)
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string, encryptionKey?: string): string {
  const key = (encryptionKey || process.env.ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encrypted: string, encryptionKey?: string): string {
  try {
    const key = (encryptionKey || process.env.ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32)
    const parts = encrypted.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
    let decrypted = decipher.update(parts[1], 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    throw new Error('Failed to decrypt data')
  }
}