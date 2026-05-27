'use client'

import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', country: 'Nigeria' })
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [toast, setToast] = useState('')
  const [strength, setStrength] = useState(0)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          country: data.country || 'Nigeria',
        })
      })
      .finally(() => setLoadingProfile(false))
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  function calcStrength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    setStrength(s)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
      if (res.ok) {
        showToast('✅ Profile updated')
        setTimeout(() => window.location.reload(), 1200)
      } else { const d = await res.json(); showToast('❌ ' + (d.message || 'Update failed')) }
    } catch { showToast('❌ Network error') }
    finally { setSaving(false) }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.newPw !== passwords.confirm) { showToast('❌ Passwords do not match'); return }
    if (passwords.newPw.length < 8) { showToast('❌ Min 8 characters'); return }
    setSavingPw(true)
    try {
      const res = await fetch('/api/user/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }) })
      if (res.ok) { showToast('✅ Password changed'); setPasswords({ current: '', newPw: '', confirm: '' }) }
      else { const d = await res.json(); showToast('❌ ' + (d.message || 'Failed')) }
    } catch { showToast('❌ Network error') }
    finally { setSavingPw(false) }
  }

  const strengthColors = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} className="animate-fade-up">{toast}</div>
      )}

      {/* Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, padding: '22px 24px' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {(profile.firstName[0] || '') + (profile.lastName[0] || '') || 'U'}
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{profile.firstName} {profile.lastName}</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{profile.email || 'No email available'}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, marginTop: 6 }}>✓ Verified account</span>
        </div>
      </div>
      {loadingProfile && <p style={{ marginBottom: 14, color: 'var(--text2)', fontSize: 12 }}>Loading profile...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal info */}
        <div className="card">
          <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 18 }}>Personal Info</h4>
          <form onSubmit={saveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label className="form-label">First name</label>
                <input className="form-input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Last name</label>
                <input className="form-input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Country</label>
              <select className="form-input" value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}>
                {['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Ghana', 'Kenya', 'South Africa', 'Germany', 'France', 'India'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', fontFamily: 'var(--font-sora)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 18 }}>Change Password</h4>
            <form onSubmit={changePassword}>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Current password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">New password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={passwords.newPw} onChange={e => { setPasswords(p => ({ ...p, newPw: e.target.value })); calcStrength(e.target.value) }} required />
                {passwords.newPw && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--bg4)', transition: 'background .3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Confirm new password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <button type="submit" disabled={savingPw} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', fontFamily: 'var(--font-sora)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: savingPw ? 0.7 : 1 }}>
                {savingPw ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>

          {/* 2FA */}
          <div className="card">
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Two-Factor Auth</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Authenticator app</p>
                <p style={{ fontSize: 12, color: 'var(--text2)' }}>Google Authenticator or Authy</p>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>Disabled</span>
            </div>
            <button style={{ background: 'linear-gradient(135deg,var(--accent-green),#059669)', border: 'none', borderRadius: 8, padding: '9px 18px', color: '#fff', fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Enable 2FA →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
