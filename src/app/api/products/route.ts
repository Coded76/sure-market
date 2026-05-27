import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/sureverifications'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category  = searchParams.get('category') ?? undefined
    const page      = Number(searchParams.get('page') ?? 1)
    const pageSize  = Number(searchParams.get('pageSize') ?? 20)

    const data = await getProducts({ category, page, pageSize })
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    // Fall back to mock data when the API isn't configured yet
    const mock = getMockProducts(req)
    return NextResponse.json(mock, { status: 200 })
  }
}

function getMockProducts(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const products = [
    { id: 'p1',  category: 'us_numbers', name: 'US Number — 646', description: 'New York area code. Instant delivery.', price: 2.50, stock: 120, features: ['Instant delivery','SMS verified','Real SIM-backed'] },
    { id: 'p2',  category: 'us_numbers', name: 'US Number — 917', description: 'New York mobile code. High deliverability.', price: 2.50, stock: 95 },
    { id: 'p3',  category: 'us_numbers', name: 'US Number — 310', description: 'California LA area code.', price: 3.00, stock: 55 },
    { id: 'p4',  category: 'us_numbers', name: 'US Number — 212', description: 'Classic NYC number.', price: 3.00, stock: 40 },
    { id: 'p5',  category: 'facebook',   name: 'Facebook — Standard', description: '2023 created, phone verified.', price: 9.00, stock: 48, features: ['Phone verified','Profile photo','Clean history'] },
    { id: 'p6',  category: 'facebook',   name: 'Facebook — Aged 2018+', description: '5+ year old accounts. Best for ads.', price: 18.00, stock: 22, features: ['5yr+ aged','High trust','Ad-ready'] },
    { id: 'p7',  category: 'instagram',  name: 'Instagram — Verified', description: 'Email + phone verified. 100–500 followers.', price: 12.00, stock: 87, features: ['Email verified','100–500 followers'] },
    { id: 'p8',  category: 'twitter',    name: 'Twitter / X Account', description: 'Phone verified. 1yr+ aged.', price: 7.00, stock: 134, features: ['Phone verified','1yr+ aged'] },
    { id: 'p9',  category: 'whatsapp',   name: 'WhatsApp Account', description: 'US number on WhatsApp. Instant delivery.', price: 5.00, stock: 200 },
    { id: 'p10', category: 'tiktok',     name: 'TikTok Account', description: 'Email verified. US registered.', price: 8.00, stock: 63 },
  ]

  const filtered = category ? products.filter(p => p.category === category) : products
  return { products: filtered, total: filtered.length }
}
