import { C } from '../../theme'
import Stepper from '../Stepper'

const lbl = { color: C.textDim, fontSize: 11, fontWeight: 600 }
const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }

function Section({ title }) {
  return (
    <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', margin: '8px 0 2px', borderBottom: `1px solid ${C.border}`, paddingBottom: 3 }}>
      {title}
    </div>
  )
}

function ToggleBtn({ active, onToggle, labelOn, labelOff, color }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
        background: active ? `${color}25` : 'transparent',
        border: `1.5px solid ${active ? color : C.border}`,
        color: active ? color : C.textMuted,
      }}
    >
      {active ? labelOn : labelOff}
    </button>
  )
}

export default function LeftPanel({ cfg, setCfg }) {
  const up = (k, v) => setCfg((p) => ({ ...p, [k]: v }))

  return (
    <div style={{ padding: '14px 16px', background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>
      <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📋 Site Configuration</div>

      <Section title="MAIN OR (4th Floor)" />
      <div style={row}><span style={lbl}>Main ORs (0-9)</span><Stepper value={cfg.mainOR} onChange={(v) => up('mainOR', v)} max={9} color={C.md} /></div>
      <div style={row}><span style={lbl}>Add-On Rooms</span><Stepper value={cfg.addOnRooms} onChange={(v) => up('addOnRooms', v)} max={3} color={C.warning} /></div>

      <Section title="APC (1st Floor)" />
      <div style={row}><span style={lbl}>APC Rooms (0-4)</span><Stepper value={cfg.apc} onChange={(v) => up('apc', v)} max={4} color={C.solo} /></div>

      <Section title="CARDIAC / TAVR" />
      <div style={row}><span style={lbl}>Cardiac Rooms (0-4)</span><Stepper value={cfg.cardiac} onChange={(v) => up('cardiac', v)} max={4} color={C.cardiac} /></div>

      <Section title="ENDO (GI)" />
      <div style={row}><span style={lbl}>Endo Rooms (0-4)</span><Stepper value={cfg.endo} onChange={(v) => up('endo', v)} max={4} color={C.endo} /></div>

      <Section title="EP LAB" />
      <div style={row}><span style={lbl}>EP Rooms (0-4)</span><Stepper value={cfg.ep} onChange={(v) => up('ep', v)} max={4} color={C.ep} /></div>
      {cfg.ep > 0 && (
        <div style={row}>
          <span style={lbl}>DCCV / TEEs</span>
          <ToggleBtn active={cfg.epTEE} onToggle={() => up('epTEE', !cfg.epTEE)} labelOn="ON — 1 room" labelOff="OFF" color={C.ep} />
        </div>
      )}

      <Section title="OB" />
      <div style={row}><span style={lbl}>C-Sections</span><Stepper value={cfg.csections} onChange={(v) => up('csections', v)} max={8} color={C.ob} /></div>

      <Section title="OTHER" />
      <div style={row}>
        <span style={lbl}>IR Case Booked</span>
        <ToggleBtn active={cfg.ir} onToggle={() => up('ir', !cfg.ir)} labelOn="YES" labelOff="NO" color={C.ir} />
      </div>
    </div>
  )
}
