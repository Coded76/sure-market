# SureMarket

A full-stack digital goods marketplace built with **Next.js 14** (App Router), powered by the **SureVerifications API**. Customers can buy US phone numbers, Facebook, Instagram, Twitter/X, WhatsApp, and TikTok accounts instantly.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS + CSS Variables      |
| Auth        | httpOnly cookie session           |
| API         | SureVerifications REST API        |
| Fonts       | Sora + JetBrains Mono             |

---

## Project Structure

```
src/
├── app/
│   ├── landing/          # Marketing / landing page
│   ├── login/            # Sign in page
│   ├── register/         # Create account page
│   ├── verify-email/     # Email OTP verification
│   ├── forgot-password/  # Password reset request
│   ├── dashboard/
│   │   ├── layout.tsx    # Sidebar + topbar shell
│   │   ├── page.tsx      # Dashboard home (stats + recent orders)
│   │   ├── shop/         # Product catalog with buy modal
│   │   ├── orders/       # Order history + credential viewer
│   │   ├── wallet/       # Balance, top-up, transactions
│   │   ├── profile/      # Personal info, password, 2FA
│   │   └── api-access/   # API key management + docs
│   └── api/
│       ├── auth/         # login, register, logout, verify-email, forgot-password
│       ├── products/     # GET /api/products
│       ├── orders/       # GET + POST /api/orders
│       ├── wallet/       # balance, transactions, topup
│       ├── dashboard/    # stats aggregation
│       └── user/         # profile, password, api-key
├── lib/
│   ├── sureverifications.ts   # Full API client (typed)
│   ├── auth.ts                # Token helpers
│   └── api-helpers.ts         # Route handler utilities
├── types/
│   └── index.ts          # All shared TypeScript types
└── middleware.ts          # Auth-guard + guest-only redirects
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required — get from https://docs.sureverifications.com
SUREVERIFICATIONS_API_KEY=your_api_key_here
SUREVERIFICATIONS_BASE_URL=https://api.sureverifications.com/v1

# Required — generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SureMarket
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/landing`.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Pages & Routes

### Public (no auth required)
| Route              | Description                        |
|--------------------|------------------------------------|
| `/landing`         | Marketing landing page             |
| `/login`           | Sign in with email + password      |
| `/register`        | Create new account                 |
| `/verify-email`    | 6-digit OTP email verification     |
| `/forgot-password` | Request password reset email       |

### Protected (requires auth)
| Route                       | Description                        |
|-----------------------------|------------------------------------|
| `/dashboard`                | Stats overview + recent orders     |
| `/dashboard/shop`           | Browse and buy products            |
| `/dashboard/orders`         | Order history + credentials        |
| `/dashboard/wallet`         | Balance, top-up, transactions      |
| `/dashboard/profile`        | Account settings + 2FA             |
| `/dashboard/api-access`     | API key + integration docs         |

---

## API Routes (internal Next.js)

All API routes proxy to the SureVerifications API. They add the platform API key server-side, so it's never exposed to the browser.

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/verify-email
POST /api/auth/forgot-password

GET  /api/products?category=&page=&pageSize=
GET  /api/orders?status=&page=&pageSize=
POST /api/orders

GET  /api/wallet/balance
GET  /api/wallet/transactions
POST /api/wallet/topup

GET  /api/dashboard/stats

GET  /api/user/profile
PATCH /api/user/profile
POST /api/user/password
POST /api/user/api-key/regenerate
```

---

## Mock Data Fallback

Every API route has a graceful fallback to realistic mock data when `SUREVERIFICATIONS_API_KEY` is not yet configured. This means the UI is fully functional and demoable before connecting to the real API.

---

## Authentication Flow

1. User logs in → `/api/auth/login` → SureVerifications returns `{ token, user }`
2. Token stored as **httpOnly cookie** (`sm_token`) — never accessible to JavaScript
3. All subsequent API calls read the cookie server-side via `getTokenFromRequest()`
4. `src/middleware.ts` enforces route protection and guest-only redirects
5. Logout clears the cookie via `/api/auth/logout`

---

## Connecting the SureVerifications API

1. Sign up at [sureverifications.com](https://sureverifications.com) and get your API key
2. Add the key to `.env.local` as `SUREVERIFICATIONS_API_KEY`
3. Verify the base URL matches: `SUREVERIFICATIONS_BASE_URL=https://api.sureverifications.com/v1`
4. All routes in `src/lib/sureverifications.ts` will automatically use real data

---

## Customisation

- **Branding**: Update the logo mark and `SureMarket` name throughout `layout.tsx` files
- **Colors**: Edit CSS variables in `src/app/globals.css` (`:root` block)
- **Products**: The shop page reads live from the API; categories are driven by `ProductCategory` in `src/types/index.ts`
- **Payment methods**: Extend the wallet page `FUND_METHODS` array and the `initiateTopUp()` call in the API library
