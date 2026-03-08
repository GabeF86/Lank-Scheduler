import { C } from '../../theme'
import Stepper from '../Stepper'

export default function StaffAvailBar({ avail, setAvail }) {
  const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }
  const lbl = { color: C.textDim, fontSize: 11, fontWeight: 600 }
  return (
    <div style={{ padding: '14px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
      <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>👥 Available Staff</div>
      <div style={row}><span style={lbl}>MDs Available</span><Stepper value={avail.mds} onChange={(v) => setAvail((p) => ({ ...p, mds: v }))} max={30} color={C.md} /></div>
      <div style={row}><span style={lbl}>CRNAs Available</span><Stepper value={avail.crnas} onChange={(v) => setAvail((p) => ({ ...p, crnas: v }))} max={30} color={C.crna} /></div>
    </div>
  )
}
