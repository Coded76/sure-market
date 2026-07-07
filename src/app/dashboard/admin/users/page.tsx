'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface UserItem {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  emailVerified: boolean
  createdAt: string
  lastLogin?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers(q?: string) {
    setLoading(true)
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/v1/admin/users${params}`)
      const data = await res.json()
      if (res.ok && data.users) {
        setUsers(data.users)
      } else {
        showToast('❌ ' + (data.error?.message || 'Failed to load users'))
      }
    } catch {
      showToast('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(userId: string, action: 'suspend' | 'activate') {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`✅ User ${action}d successfully`)
        loadUsers()
      } else {
        showToast('❌ ' + (data.error?.message || `Failed to ${action} user`))
      }
    } catch {
      showToast('❌ Network error')
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadUsers(search)
  }

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Users</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="form-input"
            style={{ width: 240 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); loadUsers() }} style={{ padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading…</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          No users found.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: u.role === 'admin' ? 'rgba(124,58,237,0.12)' : 'rgba(0,212,255,0.1)', color: u.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: u.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: u.status === 'active' ? 'var(--accent-green)' : 'var(--danger)' }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: u.emailVerified ? 'var(--accent-green)' : 'var(--text3)' }}>
                    {u.emailVerified ? '✓ Yes' : '✗ No'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-NG')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {u.status === 'active' ? (
                          <button onClick={() => handleAction(u.id, 'suspend')} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--danger)', cursor: 'pointer' }}>
                            Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleAction(u.id, 'activate')} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--accent-green)', cursor: 'pointer' }}>
                            Activate
                          </button>
                        )}
                      </div>
                    )}
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
