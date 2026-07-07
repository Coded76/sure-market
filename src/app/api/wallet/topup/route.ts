export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/server/services/PaystackService'
import { UserService } from '@/server/services/UserService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { amount } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ message: 'Minimum top-up amount is ₦100' }, { status: 400 })
    }

    const user = await UserService.getUserById(userId)
    if (!user?.email) {
      return NextResponse.json({ message: 'User email not found' }, { status: 400 })
    }

    // Convert NGN to kobo (Paystack uses lowest denomination)
    const amountInKobo = Math.round(amount * 100)

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/dashboard/wallet`

    const payment = await PaystackService.initializePayment({
      amount: amountInKobo,
      email: user.email,
      userId,
      currency: 'NGN',
      callbackUrl,
    })

    return NextResponse.json({
      authorizationUrl: payment.authorizationUrl,
      reference: payment.reference,
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Top-up initiation failed' },
      { status: err.statusCode || 500 }
    )
  }
}
