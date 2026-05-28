export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { handleError, ERROR_CODES } from '@/server/errors'
import { logger } from '@/server/logger'
import { verifyToken } from '@/server/security'
import User from '@/models/User'
import { connectDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'No authorization token', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Admin access required', code: ERROR_CODES.UNAUTHORIZED } },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    await connectDB()

    // Build filter
    const filter: any = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ]
    }

    // Get users
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    logger.info('Admin fetched users list', { adminId: decoded.userId })

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        status: u.status,
        role: u.role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Admin users fetch error', { error })
    return handleError(error)
  }
}
