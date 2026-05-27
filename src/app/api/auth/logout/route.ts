import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' }, { status: 200 })
  res.cookies.set('sm_token', '', { maxAge: 0, path: '/' })
  res.cookies.set('suremarket_token', '', { maxAge: 0, path: '/' })
  return res
}
