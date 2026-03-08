import { C } from '../../theme'

export default function AssignmentTable({ result }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Provider', 'Type', 'Site', 'Role', 'Supervised By', 'Notes'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: C.textMuted, fontWeight: 700, fontSize: 10, letterSpacing: '0.06em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.assignments.map((a, i) => {
            const sup = a.supervisedBy ? result.assignments.find((x) => x.id === a.supervisedBy) : null
            return (
              <tr key={a.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <td style={{ padding: '6px 10px', color: C.text, fontWeight: 600 }}>{a.role}</td>
                <td style={{ padding: '6px 10px' }}><span style={{ color: a.type === 'MD' ? C.md : C.crna, fontWeight: 700 }}>{a.type}</span></td>
                <td style={{ padding: '6px 10px', color: C.textDim }}>{a.site}</td>
                <td style={{ padding: '6px 10px', color: C.textDim }}>{a.isSolo ? 'Solo' : a.supervises?.length > 0 ? `Supv (${a.supervises.length})` : ''}</td>
                <td style={{ padding: '6px 10px', color: C.textDim }}>{sup ? sup.role : '—'}</td>
                <td style={{ padding: '6px 10px', color: C.textMuted, fontSize: 11 }}>{a.notes || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
