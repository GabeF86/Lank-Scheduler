import { useState } from 'react'
import { C } from '../../theme'

const SITE_CONFIG = [
  { key: '8101', label: '8101 — Schedule Runner', color: C.c8101, icon: '📋' },
  { key: 'Main OR', label: 'Main OR (4th Floor)', color: C.md, icon: '🏥' },
  { key: 'APC', label: 'APC (Surgery Center)', color: C.solo, icon: '🔧' },
  { key: 'Cardiac', label: 'Cardiac / TAVR', color: C.cardiac, icon: '❤️' },
  { key: 'Endo', label: 'Endoscopy (GI)', color: C.endo, icon: '🔬' },
  { key: 'EP Lab', label: 'EP Lab', color: C.ep, icon: '⚡' },
  { key: 'OB', label: 'OB / L&D', color: C.ob, icon: '👶' },
  { key: 'IR', label: 'IR', color: C.ir, icon: '📡' },
  { key: 'Float', label: 'Float Pool', color: C.floatCol, icon: '🔄' },
]

const CONTINGENCY_STYLES = {
  trauma: { col: C.trauma, bg: C.traumaGlow, icon: '🚨' },
  emergCS: { col: C.danger, bg: C.traumaGlow, icon: '🚨' },
  epTEE: { col: C.ep, bg: C.epGlow, icon: '⚡' },
  teeBreaks: { col: C.ep, bg: C.epGlow, icon: '☕' },
  addOnFlex: { col: C.floatCol, bg: C.floatGlow, icon: '♻️' },
  irFlex: { col: C.ir, bg: C.irGlow, icon: '📡' },
}

function CRNAChip({ crna, selected, onSelect }) {
  const sel = selected === crna.id
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('crnaId', crna.id); e.dataTransfer.effectAllowed = 'move' }}
      onClick={(e) => { e.stopPropagation(); onSelect(crna.id) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 20,
        background: sel ? C.accentGlow : C.bg,
        border: `1.5px ${crna.isAddOn ? 'dashed' : 'solid'} ${sel ? C.accent : crna.isAddOn ? `${C.warning}80` : C.border}`,
        cursor: 'grab', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: crna.isAddOn ? C.warning : C.crna }} />
      <span style={{ color: sel ? C.accent : C.text, fontSize: 11, fontWeight: 600 }}>{crna.role}</span>
    </div>
  )
}

function MDBlock({ md, siteFilter, selectedCRNA, byMD, onCRNASelect, onMDClick, onDropOnMD, dropTarget, setDropTarget }) {
  const isSolo = md.isSolo
  const borderCol = isSolo
    ? (md.isCardiac ? C.cardiac : md.is8101 ? C.c8101 : md.isFloat ? C.floatCol : C.solo)
    : C.md
  const isHovered = dropTarget === md.id
  const canAccept = !!selectedCRNA
  const allCRNAs = byMD[md.id] || []
  const myCRNAs = siteFilter && !md.is8101 ? allCRNAs.filter((c) => c.site === siteFilter) : allCRNAs

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('mdId', md.id); e.dataTransfer.effectAllowed = 'move' }}
      onDrop={(e) => { e.preventDefault(); setDropTarget(null); const id = e.dataTransfer.getData('crnaId'); if (id) onDropOnMD(id, md.id) }}
      onDragOver={(e) => { e.preventDefault(); setDropTarget(md.id) }}
      onDragLeave={() => setDropTarget(null)}
      onClick={() => { if (selectedCRNA) onMDClick(md.id) }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: selectedCRNA ? 'pointer' : 'grab' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10,
        background: (canAccept || isHovered) ? `${C.success}15` : C.card,
        border: `2px solid ${(canAccept || isHovered) ? C.success : borderCol}`,
        boxShadow: isHovered ? `0 0 14px ${C.success}50` : canAccept ? `0 0 10px ${C.success}30` : '0 1px 4px rgba(0,0,0,0.2)',
        minWidth: 120, flexShrink: 0, transition: 'all 0.2s',
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${borderCol}20`, border: `2px solid ${borderCol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: borderCol, fontSize: 9, fontWeight: 800 }}>MD</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{md.role}</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
            {isSolo && <span style={{ background: borderCol, color: '#fff', fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 3 }}>SOLO</span>}
            {md.is8101 && <span style={{ background: C.c8101, color: C.bg, fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 3 }}>8101</span>}
            {myCRNAs.length > 0 && <span style={{ color: C.textMuted, fontSize: 9 }}>{myCRNAs.length} CRNA{myCRNAs.length > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>
      {myCRNAs.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: borderCol, opacity: 0.5 }}>
            <div style={{ width: 20, height: 2, background: borderCol, opacity: 0.4 }} />
            <span style={{ fontSize: 12 }}>›</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minWidth: 0 }}>
            {myCRNAs.map((crna) => (
              <CRNAChip key={crna.id} crna={crna} selected={selectedCRNA} onSelect={onCRNASelect} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function StaffingDiagram({ result, setResult }) {
  const [selectedCRNA, setSelectedCRNA] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const { mds, crnas, contingencies = [] } = result

  const byMD = {}
  mds.forEach((m) => { byMD[m.id] = [] })
  crnas.forEach((c) => { if (c.supervisedBy && byMD[c.supervisedBy]) byMD[c.supervisedBy].push(c) })

  const reassignCRNAToMD = (crnaId, mdId) => {
    setResult((prev) => {
      const na = prev.assignments.map((a) => ({ ...a, supervises: [...(a.supervises || [])] }))
      const c = na.find((a) => a.id === crnaId)
      const old = na.find((a) => a.id === c.supervisedBy)
      const nw = na.find((a) => a.id === mdId)
      if (old) old.supervises = old.supervises.filter((id) => id !== crnaId)
      c.supervisedBy = mdId
      c.site = nw.site
      if (!nw.supervises.includes(crnaId)) nw.supervises.push(crnaId)
      nw.isSolo = false
      return { ...prev, assignments: na, mds: na.filter((a) => a.type === 'MD'), crnas: na.filter((a) => a.type === 'CRNA') }
    })
  }

  const moveMDToSite = (mdId, newSite) => {
    setResult((prev) => {
      const na = prev.assignments.map((a) => ({ ...a, supervises: [...(a.supervises || [])] }))
      const md = na.find((a) => a.id === mdId)
      if (md) md.site = newSite
      return { ...prev, assignments: na, mds: na.filter((a) => a.type === 'MD'), crnas: na.filter((a) => a.type === 'CRNA') }
    })
  }

  const onCRNASelect = (id) => setSelectedCRNA((prev) => prev === id ? null : id)
  const onMDClick = (mdId) => { if (!selectedCRNA) return; reassignCRNAToMD(selectedCRNA, mdId); setSelectedCRNA(null) }

  const mdsBySite = {}
  mds.forEach((md) => {
    const s = md.site || 'Other'
    if (!mdsBySite[s]) mdsBySite[s] = []
    mdsBySite[s].push(md)
  })

  const activeSites = SITE_CONFIG.filter((s) =>
    mdsBySite[s.key]?.length > 0 || crnas.some((c) => c.site === s.key)
  )

  return (
    <div>
      {selectedCRNA && (
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '7px 14px', marginBottom: 12, color: C.accent, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔄</span> CRNA selected — click any MD to reassign
          <button onClick={() => setSelectedCRNA(null)} style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 5, padding: '2px 10px', cursor: 'pointer', fontSize: 11 }}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeSites.map((site, si) => {
          const siteMDs = mdsBySite[site.key] || []
          const siteCRNAs = crnas.filter((c) => c.site === site.key)
          const isFloatPool = site.key === 'Float'
          const is8101Lane = site.key === '8101'
          const displayCRNACount = is8101Lane
            ? crnas.filter((c) => siteMDs.some((m) => m.supervises?.includes(c.id))).length
            : siteCRNAs.length

          const blockProps = { byMD, selectedCRNA, onCRNASelect, onMDClick, onDropOnMD: reassignCRNAToMD, dropTarget, setDropTarget }

          return (
            <div
              key={site.key}
              onDrop={(e) => { e.preventDefault(); setDropTarget(null); const mdId = e.dataTransfer.getData('mdId'); if (mdId) moveMDToSite(mdId, site.key) }}
              onDragOver={(e) => { e.preventDefault(); setDropTarget(`lane-${site.key}`) }}
              onDragLeave={() => setDropTarget(null)}
              style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                background: dropTarget === `lane-${site.key}` ? `${site.color}15` : si % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                border: dropTarget === `lane-${site.key}` ? `1.5px dashed ${site.color}` : '1.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: 130, flexShrink: 0, padding: '12px 10px', borderLeft: `3px solid ${site.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontSize: 14 }}>{site.icon}</span>
                <span style={{ color: site.color, fontSize: 10, fontWeight: 700, lineHeight: 1.2 }}>{site.label}</span>
                <span style={{ color: C.textMuted, fontSize: 9 }}>
                  {siteMDs.length > 0 ? `${siteMDs.length} MD${siteMDs.length > 1 ? 's' : ''}` : ''}
                  {siteMDs.length > 0 && displayCRNACount > 0 ? ' + ' : ''}
                  {displayCRNACount > 0 ? `${displayCRNACount} CRNA${displayCRNACount > 1 ? 's' : ''}` : ''}
                </span>
              </div>
              <div style={{ width: 1, background: C.border, margin: '8px 0', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '4px 12px', minWidth: 0, display: 'flex', alignItems: 'center' }}>
                {isFloatPool && siteMDs.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 0' }}>
                    {siteCRNAs.map((crna) => <CRNAChip key={crna.id} crna={crna} selected={selectedCRNA} onSelect={onCRNASelect} />)}
                    <span style={{ color: C.textMuted, fontSize: 9, fontStyle: 'italic' }}>8101 will supervise or assign</span>
                  </div>
                ) : isFloatPool && siteMDs.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {siteMDs.map((md) => <MDBlock key={md.id} md={md} siteFilter={site.key} {...blockProps} />)}
                    {siteCRNAs.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '4px 0 8px' }}>
                        {siteCRNAs.map((crna) => <CRNAChip key={crna.id} crna={crna} selected={selectedCRNA} onSelect={onCRNASelect} />)}
                        <span style={{ color: C.textMuted, fontSize: 9, fontStyle: 'italic' }}>8101 will supervise or assign</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>
                    {siteMDs.map((md) => <MDBlock key={md.id} md={md} siteFilter={site.key} {...blockProps} />)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Contingency Coverage */}
      {contingencies.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>CONTINGENCY COVERAGE</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {contingencies.map((cg, i) => {
              const from = result.assignments.find((a) => a.id === cg.fromId)
              const to = result.assignments.find((a) => a.id === cg.toId)
              if (!from || !to) return null
              const t = CONTINGENCY_STYLES[cg.type] || { col: C.textDim, bg: C.bg, icon: '📌' }
              return (
                <div key={i} style={{ flex: '1 1 220px', background: t.bg, border: `1.5px solid ${t.col}`, borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ color: t.col, fontSize: 11, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13 }}>{t.icon}</span>{cg.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: C.bg, border: `1.5px solid ${C.md}`, borderRadius: 5, padding: '2px 7px', fontWeight: 700, fontSize: 10, color: C.text }}>{from.role}</span>
                    {cg.fromId !== cg.toId && (
                      <>
                        <span style={{ color: t.col, fontSize: 14, fontWeight: 800 }}>→</span>
                        <span style={{ background: C.bg, border: `1.5px solid ${C.crna}`, borderRadius: 8, padding: '2px 7px', fontWeight: 700, fontSize: 10, color: C.text }}>{to.role}</span>
                      </>
                    )}
                    {cg.fromId === cg.toId && <span style={{ color: t.col, fontSize: 10, fontStyle: 'italic' }}>covers independently</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, padding: '8px 12px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ color: C.textMuted, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>LEGEND</span>
        {[
          { b: C.md, l: 'Supervising MD', s: 'r' },
          { b: C.solo, l: 'Solo MD', s: 'r' },
          { b: C.cardiac, l: 'Cardiac MD', s: 'r' },
          { b: C.c8101, l: '8101', s: 'r' },
          { b: C.crna, l: 'CRNA', s: 'd' },
          { b: C.warning, l: 'Add-On', s: 'd', da: true },
        ].map((i) => (
          <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: i.s === 'd' ? 8 : 12, height: i.s === 'd' ? 8 : 10, borderRadius: i.s === 'd' ? 4 : 3, border: `2px ${i.da ? 'dashed' : 'solid'} ${i.b}`, background: C.card, flexShrink: 0 }} />
            <span style={{ color: C.textDim, fontSize: 9 }}>{i.l}</span>
          </div>
        ))}
        <span style={{ color: C.textMuted, fontSize: 9 }}>💡 Click CRNA → click MD to reassign | Drag CRNA onto MD | Drag MD to new site lane</span>
      </div>
    </div>
  )
}
