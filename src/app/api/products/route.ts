export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Account from '@/models/Account'
import { connectDB } from '@/lib/db'

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook Account',
  instagram: 'Instagram Account',
  twitter: 'Twitter / X Account',
  whatsapp: 'WhatsApp Account',
  tiktok: 'TikTok Account',
}

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  twitter: '🐦',
  whatsapp: '💬',
  tiktok: '🎵',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)
    const platform = searchParams.get('platform') ?? undefined

    await connectDB()

    const filter: any = { status: 'available' }
    if (platform) filter.platform = platform

    const total = await Account.countDocuments(filter)
    const accounts = await Account.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)

    const products = accounts.map((a) => ({
      id: String(a._id),
      category: a.platform,
      name: PLATFORM_LABELS[a.platform] ?? `${a.platform} Account`,
      description: a.description || `Verified ${PLATFORM_LABELS[a.platform] ?? a.platform}. Instant delivery.`,
      price: a.price,
      stock: 1,
      features: ['Instant delivery', 'Email/Phone verified', 'Full credentials'],
      icon: PLATFORM_ICONS[a.platform] ?? '🌐',
    }))

    return NextResponse.json({ products, total, page, pageSize }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to load products' },
      { status: err.statusCode || 500 }
    )
  }
}