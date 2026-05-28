'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  type: 'order_delivered' | 'order_failed' | 'wallet_credited' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_ICON: Record<Notification['type'], string> = {
  order_delivered: '✅',
  order_failed: '❌',
  wallet_credited: '💰',
  system: '📢',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setNotifications(d?.notifications || [])
        setUnread(d?.unread || 0)
      })
      .finally(() => setLoading(false))
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(items => items.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications</h3>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>No notifications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => (
            <div key={n.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', background: n.read ? 'var(--bg2)' : 'rgba(124,58,237,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{TYPE_ICON[n.type]}</span>
                  <strong style={{ fontSize: 13 }}>{n.title}</strong>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.createdAt)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

