'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

type Platform = 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'tiktok'

const PLATFORM_OPTIONS: { value: Platform; label: string; icon: string }[] = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'twitter', label: 'Twitter / X', icon: '🐦' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
]

interface AccountItem {
  id: string
  platform: Platform
  emailOrPhone: string
  password: string
  twoFactorSecret?: string
  price: number
  status: string
  description?: string
  createdAt: string
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AccountItem | null>(null)
  const [toast, setToast] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const [form, setForm] = useState({
    platform: 'facebook' as Platform,
    emailOrPhone: '',
    password: '',
    twoFactorSecret: '',
    price: '',
    description: '',
  })

  useEffect(() => {
    loadAccounts()
  }, [filterPlatform])

  async function loadAccounts() {
    setLoading(true)
    try {
      const params = filterPlatform !== 'all' ? `?status=&platform=${filterPlatform}` : ''
      const res = await fetch(`/api/v1/admin/accounts${params}`)
      const data = await res.json()
      if (res.ok && data.accounts) {
        setAccounts(data.accounts)
      } else {
        showToast('❌ ' + (data.error?.message || 'Failed to load accounts'))
      }
    } catch {
      showToast('❌ Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      platform: form.platform,
      emailOrPhone: form.emailOrPhone,
      password: form.password,
      twoFactorSecret: form.twoFactorSecret,
      price: Number(form.price),
      description: form.description,
    }

    const url = editing ? `/api/v1/admin/accounts/${editing.id}` : '/api/v1/admin/accounts'
    const method = editing ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(editing ? '✅ Account updated' : '✅ Account created')
        setShowForm(false)
        setEditing(null)
        setForm({ platform: 'facebook', emailOrPhone: '', password: '', twoFactorSecret: '', price: '', description: '' })
        loadAccounts()
      } else {
        showToast('❌ ' + (data.error?.message || 'Failed to save'))
      }
    } catch {
      showToast('❌ Network error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      const res = await fetch(`/api/v1/admin/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('✅ Account deleted')
        loadAccounts()
      } else {
        showToast('❌ Failed to delete')
      }
    } catch {
      showToast('❌ Network error')
    }
  }

  function startEdit(account: AccountItem) {
    setEditing(account)
    setForm({
      platform: account.platform,
      emailOrPhone: account.emailOrPhone,
      password: account.password,
      twoFactorSecret: account.twoFactorSecret || '',
      price: String(account.price),
      description: account.description || '',
    })
    setShowForm(true)
  }

  function startCreate() {
    setEditing(null)
    setForm({ platform: 'facebook', emailOrPhone: '', password: '', twoFactorSecret: '', price: '', description: '' })
    setShowForm(true)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const platformLabel = (p: Platform) => PLATFORM_OPTIONS.find(o => o.value === p)?.label ?? p
  const platformIcon = (p: Platform) => PLATFORM_OPTIONS.find(o => o.value === p)?.icon ?? '🌐'

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Accounts</h2>
        <button onClick={startCreate} className="btn-primary" style={{ width: 'auto', padding: '8px 18px' }}>
          + Upload Account
        </button>
      </div>

      {/* Platform filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterPlatform('all')} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: filterPlatform === 'all' ? 'var(--accent)' : 'var(--bg3)', color: filterPlatform === 'all' ? '#fff' : 'var(--text2)', border: '1px solid ' + (filterPlatform === 'all' ? 'var(--accent)' : 'var(--border)') }}>
          All
        </button>
        {PLATFORM_OPTIONS.map(p => (
          <button key={p.value} onClick={() => setFilterPlatform(p.value)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: filterPlatform === p.value ? 'var(--accent)' : 'var(--bg3)', color: filterPlatform === p.value ? '#fff' : 'var(--text2)', border: '1px solid ' + (filterPlatform === p.value ? 'var(--accent)' : 'var(--border)') }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{editing ? 'Edit Account' : 'Upload New Account'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Platform</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLATFORM_OPTIONS.map(p => (
                  <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, platform: p.value }))} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: form.platform === p.value ? 'var(--accent)' : 'var(--bg3)', color: form.platform === p.value ? '#fff' : 'var(--text2)', border: '1px solid ' + (form.platform === p.value ? 'var(--accent)' : 'var(--border)'), fontWeight: 500 }}>
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Email / Phone</label>
              <input value={form.emailOrPhone} onChange={e => setForm(f => ({ ...f, emailOrPhone: e.target.value }))} required className="form-input" placeholder="user@example.com or +234..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Password</label>
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="form-input" placeholder="account password" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>2FA / Recovery Code (optional)</label>
              <input value={form.twoFactorSecret} onChange={e => setForm(f => ({ ...f, twoFactorSecret: e.target.value }))} className="form-input" placeholder="AZPKFU6SZJZ7A42D..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Price (₦)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" className="form-input" placeholder="5000" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Description (optional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" placeholder="Aged 2018+, phone verified, 1k+ friends..." />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 22px' }}>{editing ? 'Update' : 'Upload'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading…</div>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          No accounts yet. Click &quot;Upload Account&quot; to add your first account.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Platform', 'Email/Phone', 'Password', '2FA', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < accounts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{platformIcon(a.platform)}</span>
                      <span style={{ color: 'var(--text2)', fontSize: 12 }}>{platformLabel(a.platform)}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{a.emailOrPhone}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'var(--font-jetbrains)' }}>{a.password}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'var(--font-jetbrains)', color: 'var(--text2)' }}>{a.twoFactorSecret || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>₦{a.price.toLocaleString('en-NG')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: a.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(124,58,237,0.12)', color: a.status === 'available' ? 'var(--accent-green)' : 'var(--accent-purple)' }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(a)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(a.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--danger)', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
