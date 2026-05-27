# Email Service Setup Guide

This guide will help you configure email sending for user verification, password resets, and welcome emails.

## Option 1: Gmail SMTP (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "SureMarket" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SUPPORT_EMAIL=support@suremarket.com
PLATFORM_NAME=SureMarket
```

### Step 4: Test Email Sending
Register a new user and check if you receive the verification email.

---

## Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com/
2. Verify your email address
3. Complete the sender verification

### Step 2: Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "SureMarket Production"
4. Select **Full Access**
5. Copy the API key

### Step 3: Update Code to Use SendGrid
Install SendGrid SDK:
```bash
npm install @sendgrid/mail
```

Update `src/server/services/EmailService.ts` to use SendGrid instead of nodemailer.

### Step 4: Update .env File
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_USER=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
PLATFORM_NAME=SureMarket
```

---

## Option 3: Other SMTP Providers

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

---

## Testing Email Configuration

### Test 1: Registration Email
1. Register a new user
2. Check your inbox for the 6-digit verification code
3. Verify the email using the code

### Test 2: Password Reset Email
1. Go to "Forgot Password"
2. Enter your email
3. Check your inbox for the reset link
4. Click the link and reset your password

### Test 3: Welcome Email
1. Complete email verification
2. Check your inbox for the welcome email

---

## Troubleshooting

### Email Not Sending
1. **Check SMTP credentials**: Ensure they're correct in `.env`
2. **Check firewall**: Port 587 must be open
3. **Check logs**: Look for errors in the console
4. **Test SMTP connection**: Use an online SMTP tester

### Gmail "Less Secure Apps" Error
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Option 1)

### Emails Going to Spam
1. Set up SPF, DKIM, and DMARC records for your domain
2. Use a verified sender email
3. Avoid spam trigger words in subject/body
4. Use a reputable SMTP provider

### Rate Limiting
- Gmail: 500 emails/day for free accounts
- SendGrid: 100 emails/day on free tier
- Consider upgrading for production use

---

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, Mailgun, Amazon SES)
2. **Set up a custom domain** (e.g., noreply@yourdomain.com)
3. **Configure SPF, DKIM, DMARC** for better deliverability
4. **Monitor email delivery** and bounce rates
5. **Implement email queuing** for high-volume sending
6. **Add unsubscribe links** for marketing emails
7. **Log all email attempts** for debugging

---

## Email Templates

The platform includes three email templates:

1. **Verification Email**: Sent after registration with 6-digit code
2. **Password Reset Email**: Sent when user requests password reset
3. **Welcome Email**: Sent after successful email verification

All templates are responsive and mobile-friendly.

---

## Security Best Practices

1. **Never commit SMTP credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate SMTP passwords** regularly
4. **Monitor for suspicious activity**
5. **Implement rate limiting** on email endpoints
6. **Validate email addresses** before sending

---

## Need Help?

If you're still having issues:
1. Check the application logs
2. Test SMTP connection with a tool like https://www.smtper.net/
3. Contact your SMTP provider's support
4. Review their documentation for specific setup instructions
