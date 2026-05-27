import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SureMarket — Buy Verified Digital Accounts',
  description: 'Purchase verified US phone numbers, Facebook accounts, Instagram, Twitter, WhatsApp, and TikTok accounts instantly.',
  keywords: 'buy US numbers, verified accounts, facebook accounts, instagram accounts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
