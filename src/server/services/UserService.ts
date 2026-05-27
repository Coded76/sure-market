import User, { IUser } from '@/models/User'
import Wallet from '@/models/Wallet'
import { connectDB } from '@/lib/db'
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomToken,
  generateApiKey,
  hashApiKey,
} from '@/server/security'
import { AppError, ERROR_CODES, validateEmail, validatePassword } from '@/server/errors'
import { EmailService } from './EmailService'

export class UserService {
  /**
   * Register a new user
   */
  static async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    country?: string
  }): Promise<{ user: any; token: string }> {
    await connectDB()

    // Validate email
    if (!validateEmail(data.email)) {
      throw new AppError(
        400,
        'Invalid email format',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Validate password
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      throw new AppError(
        400,
        passwordValidation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      throw new AppError(
        409,
        'Email already registered',
        ERROR_CODES.EMAIL_ALREADY_EXISTS
      )
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Generate email verification token (6-digit code)
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      emailVerificationToken,
      emailVerificationTokenExpiry,
      status: 'pending',
      role: 'user',
    })

    // Create wallet for user
    await Wallet.create({
      userId: user._id,
      balance: 0,
      currency: 'USD',
    })

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, emailVerificationToken)
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error)
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
      token,
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{ user: any; token: string }> {
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      throw new AppError(
        401,
        'Invalid email or password',
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // Check if user is not suspended
    if (user.status === 'suspended' || user.status === 'deleted') {
      throw new AppError(
        403,
        'Account is suspended or deleted',
        ERROR_CODES.UNAUTHORIZED
      )
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
      }
      await user.save()

      throw new AppError(
        401,
        'Invalid email or password',
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
      throw new AppError(
        429,
        `Account locked. Try again in ${minutesLeft} minutes`,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      )
    }

    // Reset login attempts and lock
    user.loginAttempts = 0
    user.lockUntil = undefined
    user.lastLogin = new Date()

    // Activate user if pending
    if (user.status === 'pending') {
      user.status = 'active'
    }

    await user.save()

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        role: user.role,
      },
      token,
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<any> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      profilePicture: user.profilePicture,
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      firstName?: string
      lastName?: string
      country?: string
      phoneNumber?: string
      profilePicture?: string
      bio?: string
    }
  ): Promise<any> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    // Update fields
    if (data.firstName) user.firstName = data.firstName
    if (data.lastName) user.lastName = data.lastName
    if (data.country) user.country = data.country
    if (data.phoneNumber) user.phoneNumber = data.phoneNumber
    if (data.profilePicture) user.profilePicture = data.profilePicture
    if (data.bio) user.bio = data.bio

    await user.save()

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      phoneNumber: user.phoneNumber,
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError(
        401,
        'Current password is incorrect',
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new AppError(
        400,
        passwordValidation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Hash and save new password
    user.passwordHash = await hashPassword(newPassword)
    await user.save()
  }

  /**
   * Generate or regenerate API key
   */
  static async generateApiKey(userId: string): Promise<string> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    const newApiKey = generateApiKey()
    const apiKeyHash = hashApiKey(newApiKey)

    user.apiKey = newApiKey
    user.apiKeyHash = apiKeyHash
    await user.save()

    return newApiKey
  }

  /**
   * Verify email with code
   */
  static async verifyEmailWithCode(email: string, code: string): Promise<void> {
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new AppError(
        400,
        'Email already verified',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Check code
    if (
      user.emailVerificationToken !== code ||
      !user.emailVerificationTokenExpiry ||
      user.emailVerificationTokenExpiry < new Date()
    ) {
      throw new AppError(
        400,
        'Invalid or expired verification code',
        ERROR_CODES.INVALID_TOKEN
      )
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    user.status = 'active'
    await user.save()

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.firstName)
    } catch (error) {
      // Log error but don't fail verification
      console.error('Failed to send welcome email:', error)
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId: string, token: string): Promise<void> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    // Check token
    if (
      user.emailVerificationToken !== token ||
      !user.emailVerificationTokenExpiry ||
      user.emailVerificationTokenExpiry < new Date()
    ) {
      throw new AppError(
        400,
        'Invalid or expired verification token',
        ERROR_CODES.INVALID_TOKEN
      )
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    await user.save()
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ token: string }> {
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists (security)
      return { token: generateRandomToken() }
    }

    const resetToken = generateRandomToken()
    user.emailVerificationToken = resetToken
    user.emailVerificationTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    await user.save()

    // Send reset email
    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken)
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset email:', error)
    }

    return { token: resetToken }
  }

  /**
   * Reset password
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    await connectDB()

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new AppError(
        400,
        passwordValidation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      throw new AppError(
        400,
        'Invalid or expired reset token',
        ERROR_CODES.INVALID_TOKEN
      )
    }

    user.passwordHash = await hashPassword(newPassword)
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    await user.save()
  }

  /**
   * Suspend user account
   */
  static async suspendUser(userId: string, reason?: string): Promise<void> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    user.status = 'suspended'
    if (reason) {
      user.activityLog.push({
        action: `Account suspended: ${reason}`,
        timestamp: new Date(),
      })
    }
    await user.save()
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: string): Promise<void> {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(
        404,
        'User not found',
        ERROR_CODES.USER_NOT_FOUND
      )
    }

    user.status = 'active'
    user.activityLog.push({
      action: 'Account activated',
      timestamp: new Date(),
    })
    await user.save()
  }
}
