import Order from '@/models/Order'
import Verification from '@/models/Verification'
import { connectDB } from '@/lib/db'
import { AppError, ERROR_CODES } from '@/server/errors'
import { WalletService } from './WalletService'
import { SureVerificationsService } from './SureVerificationsService'
import { logAPIRequest } from '@/server/logger'

export class OrderService {
  /**
   * Create a new order (purchase number)
   */
  static async createOrder(
    userId: string,
    data: {
      serviceType: 'local' | 'global'
      service: string
      country: string
      countryCode?: string
      price: number
      currency?: string
    }
  ): Promise<any> {
    await connectDB()

    // Create order document
    const order = await Order.create({
      userId,
      serviceType: data.serviceType,
      service: data.service,
      country: data.country,
      countryCode: data.countryCode,
      price: data.price,
      currency: data.currency || 'USD',
      status: 'pending',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      smsCheckCount: 0,
      verificationAttempts: 0,
      errorLog: [],
    })

    // Debit wallet
    try {
      await WalletService.debit(
        userId,
        data.price,
        `Number purchase - ${data.country} ${data.service}`,
        order._id.toString()
      )
    } catch (error) {
      // Delete order if wallet debit fails
      await Order.deleteOne({ _id: order._id })
      throw error
    }

    // Purchase number from provider
    try {
      const purchaseResult = await SureVerificationsService.purchaseNumber(
        data.serviceType,
        {
          service: data.service,
          country: data.country,
        }
      )

      // Update order with provider info
      order.providerOrderId = purchaseResult.id
      order.phoneNumber = purchaseResult.phone_number
      order.status = 'purchased'

      // Create verification record
      await Verification.create({
        userId,
        orderId: order._id,
        status: 'pending',
        smsExpireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        retriesRemaining: 10,
      })

      await order.save()

      return {
        orderId: order._id,
        phoneNumber: order.phoneNumber,
        expiresAt: order.expiresAt,
        status: order.status,
      }
    } catch (error) {
      // Refund wallet on purchase failure
      await WalletService.refund(
        userId,
        data.price,
        `Refund: Purchase failed for ${data.country}`,
        order._id.toString()
      )

      // Update order status
      order.status = 'failed'
      if (error instanceof Error) {
        order.errorLog.push({
          timestamp: new Date(),
          error: error.message,
        })
      }
      await order.save()

      throw new AppError(
        400,
        'Failed to purchase number from provider',
        ERROR_CODES.PURCHASE_FAILED
      )
    }
  }

  /**
   * Get order details
   */
  static async getOrder(orderId: string, userId?: string): Promise<any> {
    await connectDB()

    const order = await Order.findById(orderId)
    if (!order) {
      throw new AppError(
        404,
        'Order not found',
        ERROR_CODES.ORDER_NOT_FOUND
      )
    }

    // Check authorization
    if (userId && order.userId.toString() !== userId) {
      throw new AppError(403, 'Not authorized', ERROR_CODES.UNAUTHORIZED)
    }

    return {
      id: order._id,
      status: order.status,
      serviceType: order.serviceType,
      service: order.service,
      country: order.country,
      phoneNumber: order.phoneNumber,
      price: order.price,
      currency: order.currency,
      verificationStatus: order.verificationStatus,
      smsContent: order.smsContent,
      smsReceivedAt: order.smsReceivedAt,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
    }
  }

  /**
   * Get SMS for an order
   */
  static async getSMS(orderId: string, userId: string): Promise<string> {
    await connectDB()

    const order = await Order.findById(orderId)
    if (!order) {
      throw new AppError(
        404,
        'Order not found',
        ERROR_CODES.ORDER_NOT_FOUND
      )
    }

    // Check authorization
    if (order.userId.toString() !== userId) {
      throw new AppError(403, 'Not authorized', ERROR_CODES.UNAUTHORIZED)
    }

    // Check if expired
    if (order.expiresAt < new Date()) {
      throw new AppError(
        400,
        'Order has expired',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Try to get SMS
    try {
      const smsResult = await SureVerificationsService.getSMS(
        order.serviceType,
        order.providerOrderId
      )

      if (smsResult && smsResult.sms) {
        order.smsContent = smsResult.sms
        order.smsReceivedAt = new Date()
        order.verificationStatus = 'received'
        order.status = 'verified'
        await order.save()

        // Update verification
        await Verification.findOneAndUpdate(
          { orderId: order._id },
          {
            status: 'completed',
            smsContent: smsResult.sms,
            smsReceivedAt: new Date(),
          }
        )

        return smsResult.sms
      }

      // SMS not yet received
      order.smsCheckCount++
      order.lastSmsCheckAt = new Date()
      await order.save()

      throw new AppError(
        202,
        'SMS not yet received. Please try again later.',
        ERROR_CODES.VALIDATION_ERROR
      )
    } catch (error) {
      order.smsCheckCount++
      order.lastSmsCheckAt = new Date()

      if (error instanceof Error) {
        order.errorLog.push({
          timestamp: new Date(),
          error: error.message,
        })
      }
      await order.save()

      if (error instanceof AppError) throw error

      throw new AppError(
        500,
        'Failed to fetch SMS',
        ERROR_CODES.PROVIDER_ERROR
      )
    }
  }

  /**
   * Cancel an order and refund
   */
  static async cancelOrder(
    orderId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    await connectDB()

    const order = await Order.findById(orderId)
    if (!order) {
      throw new AppError(
        404,
        'Order not found',
        ERROR_CODES.ORDER_NOT_FOUND
      )
    }

    // Check authorization
    if (order.userId.toString() !== userId) {
      throw new AppError(403, 'Not authorized', ERROR_CODES.UNAUTHORIZED)
    }

    // Can't cancel if already verified/completed
    if (order.status === 'verified' || order.status === 'completed') {
      throw new AppError(
        400,
        'Cannot cancel verified order',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Cancel with provider if needed
    if (order.providerOrderId && order.status === 'purchased') {
      try {
        await SureVerificationsService.cancelVerification(
          order.serviceType,
          order.providerOrderId
        )
      } catch (error) {
        // Log but continue with refund
        console.error('Failed to cancel with provider', error)
      }
    }

    // Update order
    order.status = 'cancelled'
    order.cancellationReason = reason
    order.cancelledAt = new Date()
    await order.save()

    // Refund wallet
    await WalletService.refund(
      userId,
      order.price,
      `Refund: Cancelled order ${orderId}`,
      order._id
    )

    // Update verification
    await Verification.findOneAndUpdate(
      { orderId: order._id },
      { status: 'cancelled' }
    )
  }

  /**
   * Get user's order history
   */
  static async getUserOrders(
    userId: string,
    options: {
      limit?: number
      skip?: number
      status?: string
    } = {}
  ): Promise<{ orders: any[]; total: number }> {
    await connectDB()

    const filter: any = { userId }
    if (options.status) filter.status = options.status

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .skip(options.skip || 0)

    const total = await Order.countDocuments(filter)

    return {
      orders: orders.map((o) => ({
        id: o._id,
        status: o.status,
        service: o.service,
        country: o.country,
        phoneNumber: o.phoneNumber,
        price: o.price,
        verificationStatus: o.verificationStatus,
        createdAt: o.createdAt,
        expiresAt: o.expiresAt,
      })),
      total,
    }
  }

  /**
   * Poll for SMS updates (for dashboard)
   */
  static async pollForUpdates(orderId: string, userId: string): Promise<{
    status: string
    verificationStatus: string
    smsContent?: string
    smsReceivedAt?: Date
  }> {
    await connectDB()

    const order = await Order.findById(orderId)
    if (!order) {
      throw new AppError(
        404,
        'Order not found',
        ERROR_CODES.ORDER_NOT_FOUND
      )
    }

    if (order.userId.toString() !== userId) {
      throw new AppError(403, 'Not authorized', ERROR_CODES.UNAUTHORIZED)
    }

    return {
      status: order.status,
      verificationStatus: order.verificationStatus,
      smsContent: order.smsContent,
      smsReceivedAt: order.smsReceivedAt,
    }
  }
}
