import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { WalletService } from '@/server/services/WalletService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const [ordersData, balanceData] = await Promise.all([
      OrderService.getUserOrders(userId, { limit: 1000 }),
      WalletService.getBalance(userId),
    ])

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const orders = ordersData.orders
    const thisMonth = orders.filter(o => new Date(o.createdAt) >= startOfMonth)

    const successfulStatuses = ['verified', 'completed']

    const stats = {
      totalOrders: ordersData.total,
      totalSpent: orders.filter(o => successfulStatuses.includes(o.status)).reduce((s, o) => s + o.price, 0),
      walletBalance: balanceData.balance,
      accountsOwned: orders.filter(o => successfulStatuses.includes(o.status)).length,
      ordersThisMonth: thisMonth.length,
      spentThisMonth: thisMonth.filter(o => successfulStatuses.includes(o.status)).reduce((s, o) => s + o.price, 0),
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load dashboard stats' }, { status: err.statusCode || 500 })
  }
}
