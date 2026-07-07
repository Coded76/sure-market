export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/server/services/PaystackService'
import { getUserIdFromRequest } from '@/lib/api-helpers'
import Transaction from '@/models/Transaction'
import { connectDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { reference } = await req.json()

    if (!reference) {
      return NextResponse.json({ message: 'Payment reference is required' }, { status: 400 })
    }

    await connectDB()

    // Idempotency check — if already credited by webhook or a previous verify call, return success
    const existing = await Transaction.findOne({
      paymentGatewayReference: reference,
      status: 'completed',
    })
    if (existing) {
      const amountInNgn = existing.amount
      return NextResponse.json({
        success: true,
        message: 'Wallet already funded',
        amount: amountInNgn,
        reference,
      }, { status: 200 })
    }

    // Verify payment with Paystack
    const verification = await PaystackService.verifyPayment(reference)

    if (!verification.success) {
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 })
    }

    // Convert amount from kobo to NGN
    const amountInNgn = verification.amount / 100

    // Credit wallet
    await PaystackService.processPaymentSuccess(userId, amountInNgn, reference)

    return NextResponse.json({
      success: true,
      message: 'Wallet funded successfully',
      amount: amountInNgn,
      reference,
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Payment verification failed' },
      { status: err.statusCode || 500 }
    )
  }
}
