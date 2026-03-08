import { C } from '../../theme'

const SEVERITY_STYLES = {
  ok: { bg: 'rgba(74,232,160,0.06)', border: C.success, text: C.success, icon: '✅', label: '' },
  tight: { bg: 'rgba(232,200,84,0.08)', border: C.warning, text: C.warning, icon: '⚠️', label: '— TIGHT' },
  warning: { bg: 'rgba(232,84,84,0.06)', border: '#E88854', text: '#E88854', icon: '🔴', label: '— STRAINED' },
  critical: { bg: 'rgba(232,84,84,0.12)', border: C.danger, text: C.danger, icon: '🚨', label: '— CRITICAL' },
}

export default function BreakCoverageAlert({ breakAnalysis }) {
  if (!breakAnalysis) return null
  const b = breakAnalysis
  const s = SEVERITY_STYLES[b.severity] || SEVERITY_STYLES.warning

  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{s.icon}</span>
          <span style={{ color: s.text, fontWeight: 700, fontSize: 12 }}>BREAK COVERAGE {s.label}</span>
          <span style={{ color: C.textMuted, fontSize: 9, fontStyle: 'italic' }}>(assuming supervising MDs & 8101 help with breaks)</span>
        </div>
        <span style={{ color: s.text, fontWeight: 800, fontSize: 14 }}>{b.pct}%</span>
      </div>

      <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${Math.min(b.pct, 100)}%`, height: '100%', borderRadius: 4, background: s.border, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: C.text, fontSize: 11 }}><b>{b.demand}</b> <span style={{ color: C.textDim }}>providers need breaks</span></span>
        <span style={{ color: C.text, fontSize: 11 }}><b>{b.capacity}</b> <span style={{ color: C.textDim }}>break slots available</span></span>
        {b.unrelieved > 0 && (
          <span style={{ background: s.border, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
            {b.unrelieved} provider{b.unrelieved > 1 ? 's' : ''} without break coverage
          </span>
        )}
      </div>
    </div>
  )
}
