import { NavLink } from 'react-router-dom'
import { UserButton, useOrganization } from '@clerk/clerk-react'
import { C } from '../theme'

const navStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 8,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
  color: isActive ? C.accent : C.textDim,
  background: isActive ? C.accentGlow : 'transparent',
  transition: 'all 0.15s',
})

export default function Layout({ children }) {
  const { organization } = useOrganization()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      {/* Sidebar */}
      <nav style={{
        width: 220,
        background: C.card,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
        gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 8px 20px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '0.05em' }}>
            ANESTHESIAFLOW
          </div>
          {organization && (
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
              {organization.name}
            </div>
          )}
        </div>

        <NavLink to="/schedule" style={({ isActive }) => navStyle(isActive)}>
          Schedule
        </NavLink>
        <NavLink to="/staff" style={({ isActive }) => navStyle(isActive)}>
          Staff
        </NavLink>
        <NavLink to="/settings" style={({ isActive }) => navStyle(isActive)}>
          Settings
        </NavLink>

        <div style={{ marginTop: 'auto', padding: '12px 8px 0', borderTop: `1px solid ${C.border}` }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
