export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Account from '@/models/Account'
import { WalletService } from '@/server/services/WalletService'
import { getUserIdFromRequest } from '@/lib/api-helpers'
import { connectDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    await connectDB()

    const filter: any = { boughtBy: userId }
    if (status) {
      filter.status = status === 'delivered' ? 'sold' : status
    }

    const total = await Account.countDocuments(filter)
    const accounts = await Account.find(filter)
      .sort({ boughtAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)

    const orders = accounts.map((a) => ({
      id: String(a._id),
      productId: String(a._id),
      productName: 'Facebook Account',
      category: 'facebook' as const,
      quantity: 1,
      unitPrice: a.price,
      totalPrice: a.price,
      status: 'delivered' as const,
      credentials: [
        { label: 'Email / Phone', value: a.emailOrPhone },
        { label: 'Password', value: a.password },
        ...(a.twoFactorSecret ? [{ label: '2FA / Recovery', value: a.twoFactorSecret }] : []),
      ],
      createdAt: a.boughtAt || a.createdAt,
    }))

    return NextResponse.json({ orders, total, page, pageSize }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load orders' }, { status: err.statusCode || 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { accountId } = await req.json()
    if (!accountId) {
      return NextResponse.json({ message: 'Account ID is required' }, { status: 400 })
    }

    await connectDB()

    const account = await Account.findById(accountId)
    if (!account || account.status !== 'available') {
      return NextResponse.json({ message: 'Account not available' }, { status: 400 })
    }

    // Debit wallet
    await WalletService.debit(
      userId,
      account.price,
      `Facebook account purchase`,
      account._id.toString()
    )

    // Mark as sold
    account.status = 'sold'
    account.boughtBy = userId as any
    account.boughtAt = new Date()
    await account.save()

    return NextResponse.json({
      success: true,
      orderId: String(account._id),
      credentials: [
        { label: 'Email / Phone', value: account.emailOrPhone },
        { label: 'Password', value: account.password },
        ...(account.twoFactorSecret ? [{ label: '2FA / Recovery', value: account.twoFactorSecret }] : []),
      ],
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Purchase failed' },
      { status: err.statusCode || 500 }
    )
  }
}
