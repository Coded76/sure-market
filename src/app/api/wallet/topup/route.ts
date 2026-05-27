import { NextRequest, NextResponse } from 'next/server'
import { initiateTopUp } from '@/lib/sureverifications'
import { getTokenFromRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { amount, method } = await req.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ message: 'Minimum top-up amount is $1' }, { status: 400 })
    }
    if (!['crypto', 'card', 'bank'].includes(method)) {
      return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 })
    }

    const data = await initiateTopUp(amount, method, token)
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Top-up initiation failed' },
      { status: err.statusCode || 400 }
    )
  }
}
