# Stripe Payment Gateway Setup Guide

This guide will help you integrate Stripe as your payment gateway for wallet top-ups.

## Why Stripe?

- ✅ Global payment support (135+ currencies)
- ✅ Strong fraud protection
- ✅ Excellent documentation
- ✅ Developer-friendly API
- ✅ Built-in checkout UI
- ✅ PCI compliance handled
- ✅ Supports cards, wallets, bank transfers

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com/
2. Click **Sign up**
3. Complete the registration form
4. Verify your email address
5. Complete business verification (for live mode)

---

## Step 2: Get API Keys

### For Development (Test Mode)

1. Log in to Stripe Dashboard: https://dashboard.stripe.com/
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### For Production (Live Mode)

1. Switch to **Live mode** in the dashboard
2. Complete business verification
3. Go to **Developers** → **API keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

---

## Step 3: Configure Webhooks

Webhooks allow Stripe to notify your application about payment events.

### Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - Development: `http://localhost:3000/api/v1/webhooks/stripe`
   - Production: `https://yourdomain.com/api/v1/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

---

## Step 4: Update Environment Variables

Update your `.env` file with the Stripe keys:

### Development (.env.local)
```env
# Stripe Payment Gateway (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Production (.env)
```env
# Stripe Payment Gateway (Live Mode)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Test the Integration

### Test Cards

Stripe provides test cards for development:

| Card Number         | Description                    |
|---------------------|--------------------------------|
| 4242 4242 4242 4242 | Successful payment             |
| 4000 0000 0000 9995 | Declined (insufficient funds)  |
| 4000 0000 0000 0002 | Declined (generic decline)     |
| 4000 0025 0000 3155 | Requires authentication (3DS)  |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Testing Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Register and log in** to your application

3. **Go to Wallet page** and click "Top Up"

4. **Enter amount** (minimum $0.50)

5. **Click "Top Up"** - you'll be redirected to Stripe Checkout

6. **Use a test card** from the table above

7. **Complete payment** - you'll be redirected back

8. **Check your wallet balance** - it should be updated

---

## Step 6: Webhook Testing (Local Development)

To test webhooks locally, use Stripe CLI:

### Install Stripe CLI

**macOS (Homebrew)**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop)**:
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux**:
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Login to Stripe CLI
```bash
stripe login
```

### Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

This will give you a webhook signing secret starting with `whsec_`. Update your `.env.local` with this secret.

### Trigger Test Events
```bash
stripe trigger checkout.session.completed
```

---

## Step 7: Create Webhook Handler (Optional Enhancement)

Create a webhook endpoint to handle Stripe events:

```typescript
// src/app/api/v1/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/server/services/StripeService'
import { logger } from '@/server/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = StripeService.verifyWebhookSignature(body, signature)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await StripeService.verifyAndProcessPayment(session.id)
        break

      case 'checkout.session.expired':
        logger.warn('Checkout session expired', { sessionId: event.data.object.id })
        break

      case 'payment_intent.payment_failed':
        logger.error('Payment failed', { paymentIntent: event.data.object.id })
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook error', { error })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
```

---

## Step 8: Go Live Checklist

Before switching to live mode:

- [ ] Complete Stripe business verification
- [ ] Test all payment flows in test mode
- [ ] Set up webhook endpoint on production server
- [ ] Update environment variables with live keys
- [ ] Enable fraud detection rules in Stripe Dashboard
- [ ] Set up email notifications for failed payments
- [ ] Configure tax settings (if applicable)
- [ ] Review Stripe's terms of service
- [ ] Test with real card (small amount)
- [ ] Monitor first few transactions closely

---

## Stripe Dashboard Features

### Payments
- View all transactions
- Issue refunds
- Export payment data

### Customers
- View customer details
- Manage payment methods
- View payment history

### Disputes
- Handle chargebacks
- Upload evidence
- Track dispute status

### Reports
- Revenue reports
- Balance reports
- Tax reports

### Settings
- Business details
- Branding (logo, colors)
- Email receipts
- Tax settings

---

## Pricing

### Stripe Fees (as of 2024)

**Standard Pricing**:
- 2.9% + $0.30 per successful card charge
- No setup fees
- No monthly fees
- No hidden costs

**International Cards**:
- Additional 1.5% for international cards
- Additional 1% for currency conversion

**Refunds**:
- Stripe fees are not refunded
- Only the payment amount is refunded

---

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all keys
3. **Verify webhook signatures** to prevent fraud
4. **Enable Stripe Radar** for fraud detection
5. **Use HTTPS** in production
6. **Implement rate limiting** on payment endpoints
7. **Log all payment attempts** for auditing
8. **Monitor for suspicious activity**

---

## Troubleshooting

### "Invalid API Key" Error
- Check that you're using the correct key (test vs live)
- Ensure no extra spaces in the key
- Verify the key hasn't been deleted

### Webhook Not Receiving Events
- Check webhook URL is correct and accessible
- Verify webhook secret is correct
- Check server logs for errors
- Use Stripe CLI to test locally

### Payment Declined
- Check card details are correct
- Try a different test card
- Check Stripe Dashboard for decline reason
- Ensure amount meets minimum ($0.50)

### Redirect Not Working
- Check success/cancel URLs are correct
- Ensure URLs are accessible
- Verify session ID is being passed correctly

---

## Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Checkout Guide**: https://stripe.com/docs/payments/checkout
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Testing Guide**: https://stripe.com/docs/testing
- **Support**: https://support.stripe.com/

---

## Migration from Paystack

If you're migrating from Paystack:

1. **Update API routes** to use StripeService instead of PaystackService
2. **Update frontend** to handle Stripe Checkout redirect
3. **Update transaction records** to use 'stripe' as payment gateway
4. **Test thoroughly** before going live
5. **Notify users** of the payment gateway change (if necessary)

The current implementation has already been updated to use Stripe!

---

## Need Help?

If you encounter issues:
1. Check Stripe Dashboard logs
2. Review application logs
3. Test with Stripe CLI
4. Contact Stripe support
5. Check Stripe status page: https://status.stripe.com/
