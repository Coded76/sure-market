'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'
import Cookies from 'js-cookie'

const NAV_MAIN: Array<{ href: string; label: string; icon: string; exact?: boolean; badge?: string }> = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', exact: true },
  { href: '/dashboard/shop', label: 'Shop', icon: '🛍', badge: 'New' },
  { href: '/dashboard/orders', label: 'My Orders', icon: '📦' },
  { href: '/dashboard/wallet', label: 'Wallet', icon: '💳' },
]

const NAV_ACCOUNT: Array<{ href: string; label: string; icon: string; exact?: boolean }> = [
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
]

const SUPPORT_TG_URL = 'https://t.me/suremarket_support'

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  const visible = Math.min(4, local.length)
  const masked = local.slice(0, visible) + '***'
  return `${masked}@${domain}`
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/wallet/balance').then(r => r.ok ? r.json() : null),
      fetch('/api/user/profile').then(r => r.ok ? r.json() : null),
    ]).then(([wallet, user]) => {
      if (wallet?.balance !== undefined) setBalance(wallet.balance)
      if (user) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
        setUserName(fullName || 'User')
        setUserEmail(user.email || '')
        setUserRole(user.role || 'user')
      }
    }).catch(() => {})
  }, [])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      Cookies.remove('suremarket_token', { path: '/' })
      Cookies.remove('sm_token', { path: '/' })
      router.replace('/login')
      router.refresh()
    }
  }

  const pageTitle =
    NAV_MAIN.find(n => isActive(n.href, n.exact))?.label ||
    NAV_ACCOUNT.find(n => isActive(n.href, n.exact))?.label ||
    'Dashboard'
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'U'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '0 0 20px',
        position: 'relative', zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', fontFamily: 'var(--font-jetbrains)', flexShrink: 0 }}>S</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>Sure<span style={{ color: 'var(--accent)' }}>Market</span></span>
        </div>

        {/* Main nav */}
        <div style={{ padding: '16px 8px 0', flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, padding: '0 8px 8px' }}>Main</div>
          {NAV_MAIN.map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: isActive(item.href, item.exact) ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: isActive(item.href, item.exact) ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: isActive(item.href, item.exact) ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: 'var(--accent-purple)', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{item.badge}</span>}
            </Link>
          ))}

          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, padding: '16px 8px 8px' }}>Account</div>
          {NAV_ACCOUNT.map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: isActive(item.href) ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: isActive(item.href) ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: isActive(item.href) ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <a
            href={SUPPORT_TG_URL}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid transparent' }}
          >
            <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>📨</span>
            Support
          </a>

          {userRole === 'admin' && (
            <>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, padding: '16px 8px 8px' }}>Admin</div>
              <Link href="/dashboard/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: pathname === '/dashboard/admin' ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: pathname === '/dashboard/admin' ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: pathname === '/dashboard/admin' ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>🛡</span>
                Admin Overview
              </Link>
              <Link href="/dashboard/admin/accounts" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: isActive('/dashboard/admin/accounts') ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: isActive('/dashboard/admin/accounts') ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: isActive('/dashboard/admin/accounts') ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>📱</span>
                Accounts
              </Link>
              <Link href="/dashboard/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: isActive('/dashboard/admin/orders') ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: isActive('/dashboard/admin/orders') ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: isActive('/dashboard/admin/orders') ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>📦</span>
                Orders
              </Link>
              <Link href="/dashboard/admin/users" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: isActive('/dashboard/admin/users') ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: isActive('/dashboard/admin/users') ? 'linear-gradient(135deg,rgba(124,58,237,0.13),rgba(0,212,255,0.08))' : 'transparent', border: isActive('/dashboard/admin/users') ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', transition: 'all .15s' }}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>👥</span>
                Users
              </Link>
            </>
          )}

          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', margin: '1px 0', borderRadius: 9, color: 'var(--text3)', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>
            <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>🚪</span>
            Sign out
          </button>
        </div>

        {/* User */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
            <small style={{ color: 'var(--text2)', fontSize: 11 }}>{maskEmail(userEmail) || 'No email'}</small>
          </div>
          {balance !== null && (
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, flexShrink: 0 }}>₦{balance.toLocaleString('en-NG')}</span>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ display: 'flex', alignItems: 'center', padding: '0 28px', height: 60, borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, gap: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>{pageTitle}</span>
          <div style={{ flex: 1, maxWidth: 320, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', marginLeft: 20 }}>
            <span style={{ color: 'var(--text3)', fontSize: 14 }}>🔍</span>
            <input placeholder="Search products…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-sora)', fontSize: 13, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {balance !== null && (
              <Link href="/dashboard/wallet" style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 9, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Balance</span>
                <strong style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--accent-green)', fontSize: 14 }}>₦{balance.toLocaleString('en-NG')}</strong>
              </Link>
            )}
            <NotificationsBell />
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
