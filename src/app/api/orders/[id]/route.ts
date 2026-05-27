import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/server/services/OrderService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const order = await OrderService.getOrder(params.id, userId)
    return NextResponse.json(order, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Order not found' },
      { status: err.statusCode || 404 }
    )
  }
}
