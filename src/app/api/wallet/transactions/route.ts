export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/server/services/WalletService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

function mapTransaction(t: any) {
  const typeMap: Record<string, 'credit' | 'debit'> = {
    topup: 'credit',
    refund: 'credit',
    purchase: 'debit',
    withdrawal: 'debit',
  }
  return {
    id: String(t.id),
    type: typeMap[t.type] || 'debit',
    amount: t.amount,
    description: t.description,
    createdAt: t.createdAt,
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    const data = await WalletService.getTransactions(userId, { limit: pageSize, skip: (page - 1) * pageSize })
    const transactions = data.transactions.map(mapTransaction)

    return NextResponse.json({ transactions, total: data.total, page, pageSize }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load transactions' }, { status: err.statusCode || 500 })
  }
}
