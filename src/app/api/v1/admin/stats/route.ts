export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import User from '@/models/User'
import Account from '@/models/Account'
import Transaction from '@/models/Transaction'
import Wallet from '@/models/Wallet'
import { connectDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Accept token from Authorization header OR httpOnly cookie
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else {
      token = cookies().get('sm_token')?.value
    }
    if (!token) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

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
    const totalAccounts = await Account.countDocuments()
    const availableAccounts = await Account.countDocuments({ status: 'available' })
    const soldAccounts = await Account.countDocuments({ status: 'sold' })

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

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-metadata')

    // Get recent sold accounts
    const recentOrders = await Account.find({ status: 'sold' })
      .sort({ boughtAt: -1 })
      .limit(10)

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
        accounts: {
          total: totalAccounts,
          available: availableAccounts,
          sold: soldAccounts,
        },
        revenue: {
          total: totalRevenue,
          currency: 'NGN',
        },
        wallet: {
          totalBalance: totalWalletBalance,
          currency: 'NGN',
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
        userId: o.boughtBy,
        account: o.emailOrPhone,
        status: o.status,
        price: o.price,
        createdAt: o.boughtAt || o.createdAt,
      })),
    })
  } catch (error) {
    logger.error('Admin stats fetch error', { error })
    return handleError(error)
  }
}
