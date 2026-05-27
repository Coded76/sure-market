import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { handleError } from '@/server/errors'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }
    const data = await UserService.requestPasswordReset(email)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
