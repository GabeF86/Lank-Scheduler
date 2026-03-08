import { C } from '../../theme'

export default function NotesPanel({ notes, result }) {
  const warnings = []
  result.mds.forEach((md) => {
    if (md.supervises && md.supervises.length > 4)
      warnings.push(`🔴 ${md.role} supervising ${md.supervises.length} CRNAs (above 1:4)`)
    else if (md.supervises && md.supervises.length > 3 && !md.is8101)
      warnings.push(`⚠️ ${md.role} supervising ${md.supervises.length} CRNAs (above 1:3)`)
  })
  const floatCount = result.assignments.filter((a) => a.isFloat || a.site === 'Float').length
  if (floatCount < 3) warnings.push(`🔴 Float pool below minimum: ${floatCount}/3`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {warnings.length > 0 && (
        <div style={{ background: 'rgba(232,84,84,0.08)', border: `1px solid ${C.danger}`, borderRadius: 10, padding: 14 }}>
          <div style={{ color: C.danger, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>⚠️ WARNINGS</div>
          {warnings.map((w, i) => <div key={i} style={{ color: C.text, fontSize: 12, padding: '3px 0' }}>{w}</div>)}
        </div>
      )}
      <div style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
        <div style={{ color: C.accent, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>📝 STAFFING NOTES</div>
        {notes.map((n, i) => <div key={i} style={{ color: C.text, fontSize: 12, padding: '3px 0' }}>{n}</div>)}
      </div>
    </div>
  )
}
