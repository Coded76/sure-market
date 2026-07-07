export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/server/services/PaystackService'
import { WalletService } from '@/server/services/WalletService'
import Transaction from '@/models/Transaction'
import { connectDB } from '@/lib/db'
import { logger } from '@/server/logger'

/**
 * Paystack Webhook Handler
 *
 * Set this URL in your Paystack dashboard:
 *   Webhook URL: https://yourdomain.com/api/webhook/paystack
 *
 * Paystack sends a POST request to this endpoint when a payment event occurs.
 * We verify the signature, then credit the wallet idempotently.
 */
export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  // 2. Verify the webhook came from Paystack (HMAC-SHA512)
  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const isValid = PaystackService.validateWebhookSignature(body, signature)
  if (!isValid) {
    logger.warn('Paystack webhook: invalid signature', { signature })
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  // 3. Only process successful charge events
  const { event, data } = body
  if (event !== 'charge.success') {
    // Acknowledge other events without processing
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const reference: string = data?.reference
  const amountInKobo: number = data?.amount
  const userId: string = data?.metadata?.userId

  if (!reference || !amountInKobo || !userId) {
    logger.warn('Paystack webhook: missing fields', { reference, amountInKobo, userId })
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  try {
    await connectDB()

    // 4. Idempotency check — don't double-credit the same reference
    const existing = await Transaction.findOne({
      paymentGatewayReference: reference,
      status: 'completed',
    })

    if (existing) {
      logger.info('Paystack webhook: duplicate reference, skipping', { reference })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // 5. Convert kobo → NGN and credit wallet
    const amountInNgn = amountInKobo / 100

    await WalletService.topUp(userId, amountInNgn, {
      paymentGateway: 'paystack',
      paymentGatewayReference: reference,
      paymentMethod: data?.channel ?? 'card',
    })

    logger.info('Paystack webhook: wallet credited', { userId, amountInNgn, reference })

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    logger.error('Paystack webhook: processing error', { error, reference })
    // Return 200 so Paystack doesn't keep retrying for logic errors.
    // For transient errors (DB down etc.) return 500 so Paystack retries.
    const isTransient = error instanceof Error && error.message.includes('connect')
    return NextResponse.json({ received: true }, { status: isTransient ? 500 : 200 })
  }
}
