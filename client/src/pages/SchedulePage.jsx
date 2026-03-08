import { useState, useEffect } from 'react'
import { C } from '../theme'
import { useClock } from '../hooks/useClock'
import { calcStaffing } from '../lib/calcStaffing'
import LeftPanel from '../components/schedule/LeftPanel'
import StaffAvailBar from '../components/schedule/StaffAvailBar'
import StaffingSummary from '../components/schedule/StaffingSummary'
import BreakCoverageAlert from '../components/schedule/BreakCoverageAlert'
import StaffingDiagram from '../components/schedule/StaffingDiagram'
import AssignmentTable from '../components/schedule/AssignmentTable'
import NotesPanel from '../components/schedule/NotesPanel'

const TABS = [
  { id: 'diagram', label: '📊 Visual Diagram' },
  { id: 'table', label: '📋 Assignment Table' },
  { id: 'notes', label: '📝 Notes & Warnings' },
]

const DEFAULT_CFG = {
  mainOR: 7, addOnRooms: 0,
  apc: 3, cardiac: 2, endo: 3, ep: 3, epTEE: false,
  csections: 1, ir: false,
}

export default function SchedulePage() {
  const [cfg, setCfg] = useState(DEFAULT_CFG)
  const [avail, setAvail] = useState({ mds: 12, crnas: 18 })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('diagram')
  const clock = useClock()

  useEffect(() => { setResult(calcStaffing(cfg, avail)) }, [cfg, avail])

  if (!result) return null

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', padding: 16, gap: 16, alignItems: 'flex-start' }}>

        {/* Left sidebar */}
        <div style={{ width: 310, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LeftPanel cfg={cfg} setCfg={setCfg} />
          <StaffAvailBar avail={avail} setAvail={setAvail} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>UAS — Anesthesia Staffing Optimizer</h1>
              <p style={{ margin: 0, fontSize: 12, color: C.textDim, marginTop: 1 }}>Daily staffing optimization</p>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', textAlign: 'right' }}>
              <div style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>{clock.time}</div>
              <div style={{ color: C.textDim, fontSize: 10 }}>{clock.day} · {clock.month} {clock.date}, {clock.year}</div>
            </div>
          </div>

          <StaffingSummary result={result} avail={avail} />
          <BreakCoverageAlert breakAnalysis={result.breakAnalysis} />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  background: tab === t.id ? C.accentGlow : 'transparent',
                  border: `1.5px solid ${tab === t.id ? C.accent : C.border}`,
                  color: tab === t.id ? C.accent : C.textDim,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, minHeight: 200 }}>
            {tab === 'diagram' && <StaffingDiagram result={result} setResult={setResult} />}
            {tab === 'table' && <AssignmentTable result={result} />}
            {tab === 'notes' && <NotesPanel notes={result.notes} result={result} />}
          </div>
        </div>
      </div>
    </div>
  )
}
