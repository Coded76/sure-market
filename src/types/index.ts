// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  country: string
  role: 'user' | 'admin'
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
  apiKey?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface WalletBalance {
  balance: number
  currency: string
}

export interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  method?: string
  createdAt: string
}

// ─── Products ─────────────────────────────────────────────────────────────────
export type ProductCategory =
  | 'us_numbers'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'whatsapp'
  | 'tiktok'

export interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  price: number
  stock: number
  areaCode?: string
  features?: string[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'failed'

export interface Order {
  id: string
  productId: string
  productName: string
  category: ProductCategory
  quantity: number
  unitPrice: number
  totalPrice: number
  status: OrderStatus
  credentials?: OrderCredential[]
  createdAt: string
}

export interface OrderCredential {
  label: string
  value: string
}

export interface CreateOrderPayload {
  productId: string
  quantity: number
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  pageSize: number
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
export interface Account {
  id: string
  platform: 'facebook'
  emailOrPhone: string
  password: string
  twoFactorSecret?: string
  price: number
  status: 'available' | 'sold' | 'reserved'
  description?: string
  createdAt: string
}

export interface AccountsResponse {
  accounts: Account[]
  total: number
  page: number
  pageSize: number
}

// ─── API Errors ───────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalOrders: number
  totalSpent: number
  walletBalance: number
  accountsOwned: number
  ordersThisMonth: number
  spentThisMonth: number
}
