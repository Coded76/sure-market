export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/server/services/WalletService'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const data = await WalletService.getBalance(userId)
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to load wallet balance' }, { status: err.statusCode || 500 })
  }
}
