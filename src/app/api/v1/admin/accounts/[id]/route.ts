export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import Account from '@/models/Account'
import { connectDB } from '@/lib/db'

function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = cookies().get('sm_token')?.value
  }
  if (!token) {
    return NextResponse.json(
      { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
      { status: 401 }
    )
  }
  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json(
      { error: { message: 'Admin access required', code: ERROR_CODES.UNAUTHORIZED } },
      { status: 403 }
    )
  }
  return null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const { emailOrPhone, password, twoFactorSecret, price, description, status } = body

    await connectDB()

    const account = await Account.findById(params.id)
    if (!account) {
      return NextResponse.json(
        { error: { message: 'Account not found', code: ERROR_CODES.NOT_FOUND } },
        { status: 404 }
      )
    }

    if (emailOrPhone !== undefined) account.emailOrPhone = emailOrPhone
    if (password !== undefined) account.password = password
    if (twoFactorSecret !== undefined) account.twoFactorSecret = twoFactorSecret
    if (price !== undefined) account.price = price
    if (description !== undefined) account.description = description
    if (status !== undefined) account.status = status

    await account.save()

    logger.info('Admin updated account', { accountId: account._id })

    return NextResponse.json({
      success: true,
      account: {
        id: account._id,
        platform: account.platform,
        emailOrPhone: account.emailOrPhone,
        price: account.price,
        status: account.status,
      },
    })
  } catch (error) {
    logger.error('Admin account update error', { error })
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    await connectDB()

    const account = await Account.findByIdAndDelete(params.id)
    if (!account) {
      return NextResponse.json(
        { error: { message: 'Account not found', code: ERROR_CODES.NOT_FOUND } },
        { status: 404 }
      )
    }

    logger.info('Admin deleted account', { accountId: account._id })

    return NextResponse.json({ success: true, message: 'Account deleted' })
  } catch (error) {
    logger.error('Admin account deletion error', { error })
    return handleError(error)
  }
}
