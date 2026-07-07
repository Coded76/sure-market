export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import Account from '@/models/Account'
import { connectDB } from '@/lib/db'

function requireAdmin(request: NextRequest) {
  // Accept token from Authorization header OR httpOnly cookie
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

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')

    await connectDB()

    const filter: any = {}
    if (status) filter.status = status
    if (platform) filter.platform = platform

    const accounts = await Account.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Account.countDocuments(filter)

    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a._id,
        platform: a.platform,
        emailOrPhone: a.emailOrPhone,
        password: a.password,
        twoFactorSecret: a.twoFactorSecret,
        price: a.price,
        status: a.status,
        description: a.description,
        boughtBy: a.boughtBy,
        boughtAt: a.boughtAt,
        createdAt: a.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Admin accounts fetch error', { error })
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const { platform, emailOrPhone, password, twoFactorSecret, price, description } = body

    if (!emailOrPhone || !password || !price) {
      return NextResponse.json(
        { error: { message: 'Email/phone, password, and price are required', code: ERROR_CODES.MISSING_REQUIRED_FIELD } },
        { status: 400 }
      )
    }

    const allowedPlatforms = ['facebook', 'instagram', 'twitter', 'whatsapp', 'tiktok']
    const resolvedPlatform = allowedPlatforms.includes(platform) ? platform : 'facebook'

    await connectDB()

    const account = await Account.create({
      platform: resolvedPlatform,
      emailOrPhone,
      password,
      twoFactorSecret: twoFactorSecret || '',
      price,
      description: description || '',
      status: 'available',
    })

    logger.info('Admin created account', { accountId: account._id })

    return NextResponse.json({
      success: true,
      account: {
        id: account._id,
        platform: account.platform,
        emailOrPhone: account.emailOrPhone,
        price: account.price,
        status: account.status,
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Admin account creation error', { error })
    return handleError(error)
  }
}
