import { C } from '../theme'

export default function Stepper({ value, onChange, min = 0, max = 30, color }) {
  const bc = color || C.accent
  const btn = {
    width: 26, height: 26, borderRadius: 6,
    border: `1px solid ${bc}`, background: 'transparent',
    color: bc, fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={btn}>−</button>
      <span style={{ color: C.text, fontSize: 16, fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={btn}>+</button>
    </div>
  )
}
