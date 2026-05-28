export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getProduct } from '@/lib/sureverifications'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProduct(params.id)
    return NextResponse.json(product, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Product not found' },
      { status: err.statusCode || 404 }
    )
  }
}
