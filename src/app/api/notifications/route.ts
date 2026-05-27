import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { WalletService } from '@/server/services/WalletService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export interface Notification {
  id: string
  type: 'order_delivered' | 'order_failed' | 'wallet_credited' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const [ordersData, txData] = await Promise.all([
      OrderService.getUserOrders(userId, { limit: 8 }),
      WalletService.getTransactions(userId, { limit: 8 }),
    ])

    const successfulStatuses = ['verified', 'completed']
    const failedStatuses = ['failed', 'cancelled', 'refunded']

    const orderNotifications: Notification[] = ordersData.orders
      .filter(order => successfulStatuses.includes(order.status) || failedStatuses.includes(order.status))
      .map(order => ({
        id: `order-${order.id}`,
        type: successfulStatuses.includes(order.status) ? 'order_delivered' : 'order_failed',
        title: successfulStatuses.includes(order.status) ? 'Order delivered' : 'Order failed',
        message: `${order.service} (${order.country}) is ${order.status}.`,
        read: false,
        createdAt: order.createdAt,
      }))

    const walletNotifications: Notification[] = txData.transactions
      .filter(tx => tx.type === 'topup' || tx.type === 'refund')
      .map(tx => ({
        id: `tx-${tx.id}`,
        type: 'wallet_credited',
        title: 'Wallet credited',
        message: `$${tx.amount.toFixed(2)} was added to your wallet via ${tx.type}.`,
        read: false,
        createdAt: tx.createdAt,
      }))

    const notifications = [...orderNotifications, ...walletNotifications]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 20)

    return NextResponse.json({ notifications, unread: notifications.length }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load notifications' }, { status: err.statusCode || 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 })
}
