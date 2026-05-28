export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import User from '@/models/User'
import Order from '@/models/Order'
import Transaction from '@/models/Transaction'
import Wallet from '@/models/Wallet'
import { connectDB } from '@/lib/db'
import { SureVerificationsService } from '@/server/services/SureVerificationsService'

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Admin access required', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 403 }
      )
    }

    await connectDB()

    // Get statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })
    const suspendedUsers = await User.countDocuments({ status: 'suspended' })
    const totalOrders = await Order.countDocuments()
    const completedOrders = await Order.countDocuments({ status: 'completed' })
    const failedOrders = await Order.countDocuments({ status: 'failed' })

    // Get revenue
    const transactions = await Transaction.aggregate([
      { $match: { type: 'topup', status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ])
    const totalRevenue = transactions[0]?.totalRevenue || 0

    // Get total wallet balance
    const wallets = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
    ])
    const totalWalletBalance = wallets[0]?.totalBalance || 0

    // Get provider balance
    let providerBalance = 0
    try {
      const balance = await SureVerificationsService.getBalance()
      providerBalance = balance.balance
    } catch {
      // Provider unavailable, continue without balance
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-metadata')

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-errorLog')

    logger.info('Admin fetched dashboard stats', {
      adminId: decoded.userId,
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          failed: failedOrders,
        },
        revenue: {
          total: totalRevenue,
          currency: 'USD',
        },
        wallet: {
          totalBalance: totalWalletBalance,
          currency: 'USD',
        },
        provider: {
          balance: providerBalance,
          currency: 'USD',
        },
      },
      recentTransactions: recentTransactions.map((t) => ({
        id: t._id,
        userId: t.userId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        userId: o.userId,
        country: o.country,
        service: o.service,
        status: o.status,
        price: o.price,
        createdAt: o.createdAt,
      })),
    })
  } catch (error) {
    logger.error('Admin stats fetch error', { error })
    return handleError(error)
  }
}
