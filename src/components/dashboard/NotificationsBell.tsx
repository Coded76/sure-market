'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'order_delivered' | 'order_failed' | 'wallet_credited' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  order_delivered: '✅',
  order_failed:    '❌',
  wallet_credited: '💰',
  system:          '📢',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NotificationsBell() {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread]               = useState(0)
  const ref                               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.notifications) { setNotifications(d.notifications); setUnread(d.unread ?? 0) }
      })
      .catch(() => {})
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)', fontSize: 17, position: 'relative', transition: 'border-color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg2)' }} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="animate-fade-up" style={{ position: 'absolute', top: 44, right: 0, width: 340, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Notifications
              {unread > 0 && <span style={{ marginLeft: 8, background: 'var(--danger)', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>{unread}</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id} style={{ display: 'flex', gap: 12, padding: '13px 16px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', background: !n.read ? 'rgba(124,58,237,0.04)' : 'transparent', transition: 'background .15s', cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(124,58,237,0.04)' : 'transparent')}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    {TYPE_ICON[n.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                      {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-purple)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 4, display: 'block' }}>{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px' }}>
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
