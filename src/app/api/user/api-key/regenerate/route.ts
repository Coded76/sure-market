export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { regenerateApiKey } from '@/lib/sureverifications'
import { getTokenFromRequest } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const data = await regenerateApiKey(token)
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to regenerate key' },
      { status: err.statusCode || 500 }
    )
  }
}
