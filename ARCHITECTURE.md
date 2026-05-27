# SureMarket Platform - Architecture Documentation

## Overview

SureMarket is a production-grade virtual number verification platform with proper separation of concerns between internal platform logic and third-party provider integration.

## Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Authentication**: JWT-based token authentication
- **Payment Gateway**: Paystack
- **Provider**: SureVerifications API

### Key Architecture Principles

1. **Separation of Concerns**: Third-party provider (SureVerifications) is ONLY responsible for:
   - Virtual number purchasing
   - SMS retrieval
   - Verification management

2. **Internal System Responsibility**:
   - User authentication & authorization
   - Wallet/balance management
   - Order/purchase history
   - Payment processing
   - Admin management
   - Logging & analytics
   - Business logic

## Database Models

### User
- Authentication credentials
- Profile information
- Account status (active, suspended, pending, deleted)
- Email verification
- Two-factor authentication
- Activity logging

### Wallet
- User balance tracking
- Deposit/spend/refund history
- Wallet status management

### Order
- Purchased number details
- Service type (local/global)
- Country and phone number
- Verification status
- SMS content and timestamps
- Expiration handling
- Error logging

### Transaction
- Top-up history
- Purchase deductions
- Refunds
- Payment gateway references
- Status tracking

### Verification
- SMS verification details
- Check attempts and retry logic
- Status tracking
- Expiration management

### AuditLog
- Admin actions
- User activities
- API calls
- Status tracking for security

### APILog
- External API calls to SureVerifications
- External API calls to payment gateways
- Success/failure tracking
- Response logging

## API Routes

### Authentication

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "country": "US"
}

Response (201):
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false
  },
  "token": "jwt_token"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "user": {...},
  "token": "jwt_token"
}
```

### Wallet Management

#### Get Balance
```
GET /api/v1/wallet/balance
Authorization: Bearer {token}

Response (200):
{
  "balance": 1500.00,
  "currency": "USD",
  "totalDeposited": 2000.00,
  "totalSpent": 500.00,
  "totalRefunded": 0.00
}
```

#### Initialize Top-up
```
POST /api/v1/wallet/topup/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00
}

Response (200):
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code",
  "reference": "payment_reference"
}
```

#### Verify Top-up
```
POST /api/v1/wallet/topup/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "reference": "payment_reference"
}

Response (200):
{
  "success": true,
  "amount": 100.00
}
```

### Orders/Purchases

#### Create Order (Purchase Number)
```
POST /api/v1/orders/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceType": "local",
  "service": "facebook",
  "country": "US",
  "price": 2.50
}

Response (201):
{
  "orderId": "order_id",
  "phoneNumber": "+1234567890",
  "expiresAt": "2024-05-26T10:10:00Z",
  "status": "purchased"
}
```

#### Get SMS
```
GET /api/v1/orders/{orderId}/sms
Authorization: Bearer {token}

Response (200):
{
  "sms": "Your verification code is: 123456"
}

Response (202) - SMS Not Yet Received:
{
  "error": {
    "message": "SMS not yet received. Please try again later.",
    "code": "VALIDATION_ERROR"
  }
}
```

#### Poll for Updates
```
GET /api/v1/orders/{orderId}/status
Authorization: Bearer {token}

Response (200):
{
  "status": "verified",
  "verificationStatus": "received",
  "smsContent": "Your code is: 123456",
  "smsReceivedAt": "2024-05-26T10:05:00Z"
}
```

### User Profile

#### Get Profile
```
GET /api/v1/user/profile
Authorization: Bearer {token}

Response (200):
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "country": "US",
  "emailVerified": true,
  "role": "user"
}
```

#### Update Profile
```
PUT /api/v1/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "country": "US",
  "phoneNumber": "+1234567890"
}

Response (200):
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Admin Dashboard

#### List Users
```
GET /api/v1/admin/users?page=1&limit=20&status=active&search=john
Authorization: Bearer {admin_token}

Response (200):
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2024-05-26T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Manage User
```
POST /api/v1/admin/users/{userId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "action": "suspend",
  "reason": "Suspicious activity"
}

Available actions: suspend, activate, refund
```

#### Dashboard Stats
```
GET /api/v1/admin/stats
Authorization: Bearer {admin_token}

Response (200):
{
  "stats": {
    "users": {
      "total": 150,
      "active": 120,
      "suspended": 10
    },
    "orders": {
      "total": 500,
      "completed": 480,
      "failed": 20
    },
    "revenue": {
      "total": 5000.00,
      "currency": "USD"
    },
    "wallet": {
      "totalBalance": 500.00,
      "currency": "USD"
    },
    "provider": {
      "balance": 1000.00,
      "currency": "USD"
    }
  },
  "recentTransactions": [...],
  "recentOrders": [...]
}
```

## Error Handling

The API uses consistent error responses:

```json
{
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_ALREADY_EXISTS` - Email already registered
- `USER_NOT_FOUND` - User doesn't exist
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_BALANCE` - Not enough wallet balance
- `UNAUTHORIZED` - Not authorized to access resource
- `VALIDATION_ERROR` - Invalid input
- `PROVIDER_ERROR` - Provider API error
- `PAYMENT_FAILED` - Payment processing failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Secure token generation
- Token expiration (7 days default)

### Authorization
- Role-based access control (user, admin)
- User account status verification
- Resource ownership validation

### Rate Limiting
- IP-based rate limiting
- Configurable request limits
- Automatic lockout after failed login attempts

### Data Protection
- API key encryption
- Secure password reset flow
- Email verification requirement
- Two-factor authentication support

### Logging & Auditing
- Comprehensive audit logs
- API call logging
- Failed request tracking
- Admin action logging

## Service Layers

### UserService
- Registration
- Login
- Profile management
- Password management
- API key generation
- Email verification
- Account suspension/activation

### WalletService
- Balance retrieval
- Top-up processing
- Purchase deductions
- Refund processing
- Transaction history
- Admin refunds

### OrderService
- Order creation
- SMS retrieval
- Order cancellation
- Refund processing
- Order history
- Status polling

### SureVerificationsService
- Balance retrieval
- Country list
- Service listing (local & global)
- Pricing
- Number purchase
- SMS retrieval
- Verification cancellation
- Health checks

### PaystackService
- Payment initialization
- Payment verification
- Webhook handling
- Transaction recording
- Balance updates

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/suremarket

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=7d

# SureVerifications API
SUREVERIFICATIONS_API_KEY=your-api-key
SUREVERIFICATIONS_BASE_URL=https://api.sureverifications.com/v1

# Paystack Payment Gateway
PAYSTACK_PUBLIC_KEY=your-public-key
PAYSTACK_SECRET_KEY=your-secret-key

# Admin Settings
ADMIN_EMAIL=admin@suremarket.com
ADMIN_SECRET_KEY=your-admin-secret

# Platform Settings
PLATFORM_NAME=SureMarket
PLATFORM_CURRENCY=USD
```

## Development

### Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Build
```bash
npm run build
npm start
```

## Deployment

1. Ensure all environment variables are configured
2. Build the project: `npm run build`
3. Set up MongoDB cluster
4. Configure payment gateway credentials
5. Set up provider API credentials
6. Deploy to preferred hosting (Vercel, AWS, etc.)

## Future Enhancements

- [ ] WebSocket for real-time SMS updates
- [ ] Advanced analytics dashboard
- [ ] Automated refund system
- [ ] SMS webhook integration
- [ ] Multi-currency support
- [ ] API rate limiting improvements
- [ ] Caching layer (Redis)
- [ ] Email notifications service
- [ ] Phone-based two-factor authentication
- [ ] Custom branding per reseller

## Support

For issues or questions, contact support@suremarket.com
