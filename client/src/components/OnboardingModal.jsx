import { useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { C } from '../theme'
import { staffApi } from '../api/staff'
import { setAuthToken } from '../api/client'

export default function OnboardingModal({ onComplete }) {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    type: '',
    specialty: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type) return setError('Please select your role (MD or CRNA).')
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      setAuthToken(token)
      await staffApi.sync(form)
      onComplete()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const card = {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 40, width: 440,
    display: 'flex', flexDirection: 'column', gap: 20,
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: `1px solid ${C.border}`, background: C.bg,
    color: C.text, fontSize: 14, boxSizing: 'border-box',
  }

  const label = { fontSize: 12, color: C.textDim, marginBottom: 4, display: 'block' }

  return (
    <div style={overlay}>
      <div style={card}>
        <div>
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>Welcome</h2>
          <p style={{ color: C.textDim, fontSize: 14, margin: '6px 0 0' }}>
            Tell us a bit about yourself to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>First Name</label>
              <input style={inputStyle} value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Last Name</label>
              <input style={inputStyle} value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>

          <div>
            <label style={label}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={set('email')} required />
          </div>

          <div>
            <label style={label}>Role *</label>
            <select style={inputStyle} value={form.type} onChange={set('type')} required>
              <option value="">Select role...</option>
              <option value="MD">MD (Physician)</option>
              <option value="CRNA">CRNA</option>
            </select>
          </div>

          <div>
            <label style={label}>Specialty <span style={{ color: C.textMuted }}>(optional)</span></label>
            <input style={inputStyle} value={form.specialty} onChange={set('specialty')}
              placeholder="e.g. Cardiac, General, Endo" />
          </div>

          {error && <p style={{ color: C.danger, fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 0', borderRadius: 6, border: 'none',
              background: loading ? C.accentDim : C.accent,
              color: '#000', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
