import nodemailer from 'nodemailer'
import { logger } from '@/server/logger'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || ''
const PLATFORM_NAME = process.env.PLATFORM_NAME || 'SureMarket'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@suremarket.com'

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  })

  /**
   * Send verification email with 6-digit code
   */
  static async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${PLATFORM_NAME}" <${SMTP_USER}>`,
        to: email,
        subject: `Verify your ${PLATFORM_NAME} account`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 30px;">
                        <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 700; color: #1a1a1a;">Verify your email address</h1>
                        <p style="margin: 0 0 30px; font-size: 15px; line-height: 1.6; color: #666;">
                          Welcome to ${PLATFORM_NAME}! Please use the verification code below to complete your registration:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                          <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${code}
                          </div>
                        </div>
                        
                        <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666;">
                          This code will expire in <strong>24 hours</strong>. If you didn't request this code, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.6;">
                          Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">${SUPPORT_EMAIL}</a>
                        </p>
                        <p style="margin: 10px 0 0; font-size: 13px; color: #999;">
                          © ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
          Verify your ${PLATFORM_NAME} account
          
          Your verification code is: ${code}
          
          This code will expire in 24 hours.
          
          If you didn't request this code, please ignore this email.
          
          Need help? Contact us at ${SUPPORT_EMAIL}
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info('Verification email sent', { email })
    } catch (error) {
      logger.error('Failed to send verification email', { error, email })
      throw new Error('Failed to send verification email')
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

      const mailOptions = {
        from: `"${PLATFORM_NAME}" <${SMTP_USER}>`,
        to: email,
        subject: `Reset your ${PLATFORM_NAME} password`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 30px;">
                        <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 700; color: #1a1a1a;">Reset your password</h1>
                        <p style="margin: 0 0 30px; font-size: 15px; line-height: 1.6; color: #666;">
                          We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                            Reset Password
                          </a>
                        </div>
                        
                        <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666;">
                          This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                        
                        <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: #999;">
                          If the button doesn't work, copy and paste this link into your browser:<br>
                          <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.6;">
                          Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">${SUPPORT_EMAIL}</a>
                        </p>
                        <p style="margin: 10px 0 0; font-size: 13px; color: #999;">
                          © ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
          Reset your ${PLATFORM_NAME} password
          
          We received a request to reset your password. Click the link below to create a new password:
          
          ${resetUrl}
          
          This link will expire in 1 hour.
          
          If you didn't request a password reset, please ignore this email.
          
          Need help? Contact us at ${SUPPORT_EMAIL}
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info('Password reset email sent', { email })
    } catch (error) {
      logger.error('Failed to send password reset email', { error, email })
      throw new Error('Failed to send password reset email')
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${PLATFORM_NAME}" <${SMTP_USER}>`,
        to: email,
        subject: `Welcome to ${PLATFORM_NAME}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 30px;">
                        <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 700; color: #1a1a1a;">Welcome to ${PLATFORM_NAME}, ${firstName}! 🎉</h1>
                        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #666;">
                          Your account has been successfully verified. You're all set to start using our platform!
                        </p>
                        
                        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                          <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Getting Started:</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                            <li>Fund your wallet to get started</li>
                            <li>Browse available services and countries</li>
                            <li>Purchase virtual numbers for verification</li>
                            <li>Manage your orders and transactions</li>
                          </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                            Go to Dashboard
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.6;">
                          Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">${SUPPORT_EMAIL}</a>
                        </p>
                        <p style="margin: 10px 0 0; font-size: 13px; color: #999;">
                          © ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
          Welcome to ${PLATFORM_NAME}, ${firstName}!
          
          Your account has been successfully verified. You're all set to start using our platform!
          
          Getting Started:
          - Fund your wallet to get started
          - Browse available services and countries
          - Purchase virtual numbers for verification
          - Manage your orders and transactions
          
          Visit your dashboard: ${process.env.NEXTAUTH_URL}/dashboard
          
          Need help? Contact us at ${SUPPORT_EMAIL}
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info('Welcome email sent', { email })
    } catch (error) {
      logger.error('Failed to send welcome email', { error, email })
      // Don't throw error for welcome email - it's not critical
    }
  }
}
