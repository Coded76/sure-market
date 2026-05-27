import Wallet from '@/models/Wallet'
import Transaction, { type ITransaction } from '@/models/Transaction'
import User from '@/models/User'
import { connectDB } from '@/lib/db'
import { AppError, ERROR_CODES } from '@/server/errors'

export class WalletService {
  /**
   * Get wallet balance for a user
   */
  static async getBalance(userId: string): Promise<{
    balance: number
    currency: string
    totalDeposited: number
    totalSpent: number
    totalRefunded: number
  }> {
    await connectDB()

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    return {
      balance: wallet.balance,
      currency: wallet.currency,
      totalDeposited: wallet.totalDeposited,
      totalSpent: wallet.totalSpent,
      totalRefunded: wallet.totalRefunded,
    }
  }

  /**
   * Credit wallet (top-up)
   */
  static async topUp(
    userId: string,
    amount: number,
    options: {
      paymentGateway?: string
      paymentGatewayReference?: string
      paymentMethod?: string
      transactionId?: string
    }
  ): Promise<ITransaction> {
    await connectDB()

    if (amount <= 0) {
      throw new AppError(
        400,
        'Amount must be greater than 0',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      type: 'topup',
      amount,
      currency: wallet.currency,
      status: 'completed',
      description: `Wallet top-up of ${amount} ${wallet.currency}`,
      paymentGateway: options.paymentGateway,
      paymentGatewayReference: options.paymentGatewayReference,
      paymentMethod: options.paymentMethod,
      processedAt: new Date(),
    })

    // Update wallet
    wallet.balance += amount
    wallet.totalDeposited += amount
    wallet.lastTopUpDate = new Date()
    await wallet.save()

    return transaction
  }

  /**
   * Debit wallet (for purchases)
   */
  static async debit(
    userId: string,
    amount: number,
    description: string,
    orderId?: string
  ): Promise<ITransaction> {
    await connectDB()

    if (amount <= 0) {
      throw new AppError(
        400,
        'Amount must be greater than 0',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new AppError(
        400,
        'Insufficient balance',
        ERROR_CODES.INSUFFICIENT_BALANCE
      )
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      type: 'purchase',
      amount,
      currency: wallet.currency,
      status: 'completed',
      description,
      orderId,
      processedAt: new Date(),
    })

    // Update wallet
    wallet.balance -= amount
    wallet.totalSpent += amount
    await wallet.save()

    return transaction
  }

  /**
   * Refund wallet (for cancelled orders)
   */
  static async refund(
    userId: string,
    amount: number,
    description: string,
    orderId?: string
  ): Promise<ITransaction> {
    await connectDB()

    if (amount <= 0) {
      throw new AppError(
        400,
        'Amount must be greater than 0',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      type: 'refund',
      amount,
      currency: wallet.currency,
      status: 'completed',
      description,
      orderId,
      processedAt: new Date(),
    })

    // Update wallet
    wallet.balance += amount
    wallet.totalRefunded += amount
    await wallet.save()

    return transaction
  }

  /**
   * Get transaction history
   */
  static async getTransactions(
    userId: string,
    options: {
      type?: string
      status?: string
      limit?: number
      skip?: number
    } = {}
  ): Promise<{ transactions: any[]; total: number }> {
    await connectDB()

    const filter: any = { userId }
    if (options.type) filter.type = options.type
    if (options.status) filter.status = options.status

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .skip(options.skip || 0)

    const total = await Transaction.countDocuments(filter)

    return {
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
      total,
    }
  }

  /**
   * Update wallet status (freeze, suspend, etc.)
   */
  static async updateWalletStatus(
    userId: string,
    status: 'active' | 'frozen' | 'suspended'
  ): Promise<void> {
    await connectDB()

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    wallet.status = status
    await wallet.save()
  }

  /**
   * Admin refund user
   */
  static async adminRefund(
    userId: string,
    amount: number,
    reason: string
  ): Promise<ITransaction> {
    await connectDB()

    const wallet = await Wallet.findOne({ userId })
    if (!wallet) {
      throw new AppError(
        404,
        'Wallet not found',
        ERROR_CODES.WALLET_NOT_FOUND
      )
    }

    const transaction = await Transaction.create({
      userId,
      type: 'refund',
      amount,
      currency: wallet.currency,
      status: 'completed',
      description: `Admin refund: ${reason}`,
      processedAt: new Date(),
    })

    wallet.balance += amount
    wallet.totalRefunded += amount
    await wallet.save()

    return transaction
  }
}
