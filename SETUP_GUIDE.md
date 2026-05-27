# SureMarket Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Paystack account (https://paystack.com) for payments
- SureVerifications API account for virtual numbers

### Local Development Setup

#### 1. Clone and Install Dependencies
```bash
cd suremarket
npm install
```

#### 2. Environment Configuration
```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

Required environment variables to configure:

**MongoDB:**
- `MONGODB_URI` - MongoDB Atlas connection string

**Authentication:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`

**API Keys:**
- `SUREVERIFICATIONS_API_KEY` - From SureVerifications dashboard
- `PAYSTACK_PUBLIC_KEY` - From Paystack dashboard
- `PAYSTACK_SECRET_KEY` - From Paystack dashboard (keep secret!)

#### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### MongoDB Setup

#### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Add `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/suremarket
   ```

#### Option 2: Local MongoDB
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/suremarket
```

### Payment Gateway Setup (Paystack)

1. Create account at https://paystack.com
2. Go to Settings → API Keys
3. Copy Public and Secret keys
4. Add to `.env.local`:
   ```env
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   ```

### SureVerifications API Setup

1. Register at https://sureverifications.com
2. Get API key from dashboard
3. Add to `.env.local`:
   ```env
   SUREVERIFICATIONS_API_KEY=your-api-key
   ```

## Project Structure

```
src/
├── app/
│   ├── api/v1/          # API routes
│   ├── dashboard/       # User dashboard pages
│   ├── landing/         # Landing page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── layout.tsx       # Main layout
├── components/          # Reusable components
├── hooks/              # Custom React hooks
├── lib/                # Utilities & helpers
├── models/             # MongoDB schemas
├── server/             # Server-side logic
│   ├── middleware/     # Auth, rate limiting
│   ├── services/       # Business logic
│   ├── errors.ts       # Error handling
│   ├── logger.ts       # Logging
│   └── security.ts     # Security utilities
└── types/              # TypeScript types
```

## Database Models

### User
- Email & password authentication
- Profile data
- Account status
- Activity logging

### Wallet
- Balance tracking
- Deposit/spend history
- Status management

### Order
- Purchased numbers
- Verification status
- SMS content
- Expiration tracking

### Transaction
- Payment history
- Top-ups
- Purchases
- Refunds

### Verification
- SMS details
- Check attempts
- Expiration

### AuditLog & APILog
- Security auditing
- API call tracking

## API Testing

### Using cURL

#### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Get Balance (replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import collection from `postman_collection.json` (create from above endpoints)
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `token`: Your JWT token from login
3. Test endpoints

## Building for Production

### Build
```bash
npm run build
```

### Environment for Production
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
# Update all other variables for production
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import project
4. Add environment variables
5. Deploy

Deployment details: https://nextjs.org/docs/deployment/vercel

### Deploy to Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t suremarket .
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://... \
  -e PAYSTACK_SECRET_KEY=... \
  suremarket
```

## Testing

### Unit Tests
```bash
npm run test
```

### API Integration Tests
```bash
npm run test:api
```

### E2E Tests
```bash
npm run test:e2e
```

## Monitoring & Logging

- Check `src/server/logger.ts` for logging configuration
- All API calls are logged to MongoDB (APILog collection)
- All user actions are logged (AuditLog collection)
- View logs in MongoDB Atlas or via API

## Security Checklist

- [ ] Change all default credentials
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set strong JWT secret
- [ ] Configure firewall rules
- [ ] Enable API authentication
- [ ] Set up monitoring/alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
- Check MongoDB is running
- Verify MONGODB_URI is correct
- Ensure IP whitelist on Atlas includes your IP

### API Key Errors
```
Error: Invalid API Key
```
- Verify API keys are correct
- Check environment variables are loaded
- Restart development server after changing .env

### Payment Gateway Errors
```
Error: Payment verification failed
```
- Verify Paystack keys are correct
- Check if using test vs live keys
- Ensure webhook URL is configured

### Token Expiration
```
Error: Invalid or expired token
```
- Token expires after 7 days
- User must login again
- Clear cookies: `Cookies.remove('suremarket_token')`

## Performance Optimization

1. **Caching**
   - Implement Redis for session caching
   - Cache country/service lists

2. **Database**
   - Add indexes on frequently queried fields ✓ (Done)
   - Use pagination for large datasets ✓ (Done)
   - Archive old orders/logs

3. **API**
   - Implement compression
   - Use CDN for static assets
   - Implement request coalescing

4. **Frontend**
   - Lazy load components
   - Optimize images
   - Implement progressive loading

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer (Vercel handles this)
   - Database replication
   - Redis for caching

2. **Rate Limiting**
   - Implement with Redis
   - Per-user rate limits
   - API endpoint throttling

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - Uptime monitoring

## Support & Resources

- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Paystack Docs: https://paystack.com/docs
- SureVerifications API: https://docs.sureverifications.com

## License

Proprietary - SureMarket

## Support

Email: support@suremarket.com
