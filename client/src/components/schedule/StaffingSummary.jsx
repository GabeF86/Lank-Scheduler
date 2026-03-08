import { C } from '../../theme'

function ProviderCard({ label, color, required, available }) {
  const gap = required - available
  const ok = gap <= 0
  const surplus = ok && available > required ? available - required : 0

  return (
    <div style={{ background: C.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${ok ? C.success : C.danger}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color, fontWeight: 700, fontSize: 12 }}>{label}</span>
        <span style={{ background: ok ? 'rgba(74,232,160,0.15)' : 'rgba(232,84,84,0.15)', color: ok ? C.success : C.danger, fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 5 }}>
          {ok ? 'COVERED' : `NEED ${gap}`}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textDim, fontSize: 13 }}>
        <span>Required: <b style={{ color: C.text, fontSize: 15 }}>{required}</b></span>
        <span>Available: <b style={{ color: C.text, fontSize: 15 }}>{available}</b></span>
      </div>
      {!ok && (
        <div style={{ marginTop: 8, background: C.bg, borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ color: C.danger, fontSize: 11, fontWeight: 600 }}>📥 Acquire {gap} {label}{gap > 1 ? 's' : ''} from another site</div>
        </div>
      )}
      {surplus > 0 && (
        <div style={{ marginTop: 8, background: C.bg, borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ color: C.success, fontSize: 11, fontWeight: 600 }}>📤 {surplus} surplus {label}{surplus > 1 ? 's' : ''} — can send to another site</div>
        </div>
      )}
    </div>
  )
}

export default function StaffingSummary({ result, avail }) {
  const mdOk = result.totalMDs <= avail.mds
  const crnaOk = result.totalCRNAs <= avail.crnas
  const allGood = mdOk && crnaOk

  return (
    <div style={{
      background: allGood ? 'rgba(74,232,160,0.04)' : 'rgba(232,84,84,0.04)',
      border: `1.5px solid ${allGood ? C.success : C.danger}`,
      borderRadius: 12, padding: '14px 18px', marginBottom: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{allGood ? '✅' : '🚨'}</span>
        <span style={{ color: allGood ? C.success : C.danger, fontWeight: 700, fontSize: 14 }}>
          {allGood ? 'Fully Staffed — No Additional Providers Needed' : 'Staff Shortage — Need to Acquire Providers'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ProviderCard label="MD" color={C.md} required={result.totalMDs} available={avail.mds} />
        <ProviderCard label="CRNA" color={C.crna} required={result.totalCRNAs} available={avail.crnas} />
      </div>
    </div>
  )
}
