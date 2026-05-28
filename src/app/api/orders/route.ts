export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

function mapInternalOrderToFrontend(o: any) {
  const statusMap: Record<string, string> = {
    pending: 'pending',
    purchased: 'processing',
    verified: 'delivered',
    completed: 'delivered',
    failed: 'failed',
    cancelled: 'failed',
    refunded: 'failed',
  }
  const credentials = []
  if (o.phoneNumber) {
    credentials.push({ label: 'Phone Number', value: o.phoneNumber })
  }

  return {
    id: String(o.id),
    productId: String(o.id),
    productName: `${o.service} (${o.country})`,
    category: 'us_numbers',
    quantity: 1,
    unitPrice: o.price,
    totalPrice: o.price,
    status: statusMap[o.status] || 'pending',
    credentials: credentials.length ? credentials : undefined,
    createdAt: o.createdAt,
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    const data = await OrderService.getUserOrders(userId, { limit: 1000 })
    let orders = data.orders.map(mapInternalOrderToFrontend)

    if (status) {
      orders = orders.filter(o => o.status === status)
    }

    const total = orders.length
    const start = (page - 1) * pageSize
    const paginated = orders.slice(start, start + pageSize)

    return NextResponse.json({ orders: paginated, total, page, pageSize }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load orders' }, { status: err.statusCode || 500 })
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { message: 'Shop ordering is temporarily unavailable. Please use the verification service.' },
    { status: 400 }
  )
}
