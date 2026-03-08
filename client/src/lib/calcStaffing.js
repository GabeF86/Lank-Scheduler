/**
 * Core staffing algorithm.
 * Pure function — no React dependencies.
 */
export function calcStaffing(cfg, avail = { mds: 99, crnas: 99 }) {
  const asgn = []
  let mdt = 0, crt = 0
  const contingencies = []
  const push = (o) => { asgn.push(o); return o }

  // ── MD Budget — estimate total need and decide if we must conserve ──
  const fixedMDs = 1 + 1 + cfg.cardiac
  const totalORs_est = cfg.mainOR + cfg.addOnRooms
  const orSupvEst = totalORs_est > 0 ? Math.max(1, Math.ceil((totalORs_est - 2) / 3)) : 0
  const endoMDEst = cfg.endo > 0 ? 1 : 0
  const epMDEst = cfg.ep > 0 ? 1 : 0
  const apcMDEst = cfg.apc >= 2 ? 2 : cfg.apc
  const totalMDEst = fixedMDs + endoMDEst + epMDEst + apcMDEst + orSupvEst
  const mdTight = totalMDEst >= avail.mds

  // ── 8101 — Schedule Runner ──
  const md8101 = push({
    id: `md-${mdt++}`, type: 'MD', role: '8101', site: '8101',
    supervises: [], isSolo: true, is8101: true,
    notes: 'Runs schedule. Available for emergencies, traumas, epidurals. Avoids rooms if possible.',
  })

  // ── OB — always staffed ──
  const obMD = push({
    id: `md-${mdt++}`, type: 'MD', role: 'OB MD', site: 'OB',
    supervises: [], isSolo: true,
    notes: 'Covers L&D, epidurals, C-sections.',
  })

  // ── Cardiac — solo MDs only ──
  const cardiacMDs = []
  for (let i = 0; i < cfg.cardiac; i++) {
    cardiacMDs.push(push({
      id: `md-${mdt++}`, type: 'MD', role: `Cardiac ${i + 1}`, site: 'Cardiac',
      supervises: [], isSolo: true, isCardiac: true,
      notes: 'Cardiac anesthesiologist. Solo coverage including TAVR.',
    }))
  }

  // ── Endo — 1 MD supervising CRNAs ──
  let endoMD = null
  const endoCRNAs = []
  if (cfg.endo > 0) {
    endoMD = push({
      id: `md-${mdt++}`, type: 'MD', role: 'Endo MD', site: 'Endo',
      supervises: [], isSolo: cfg.endo === 0,
      notes: 'Dedicated Endo MD supervising GI CRNAs.',
    })
    for (let i = 0; i < cfg.endo; i++) {
      const c = push({ id: `crna-${crt++}`, type: 'CRNA', role: `Endo ${i + 1}`, site: 'Endo', supervisedBy: endoMD.id })
      endoMD.supervises.push(c.id)
      endoCRNAs.push(c)
    }
  }

  // ── EP — MD supervising CRNAs, toggle for DCCV/TEE ──
  let epMD = null
  const epCRNAs = []
  if (cfg.ep > 0) {
    const procRooms = cfg.epTEE ? cfg.ep - 1 : cfg.ep
    epMD = push({
      id: `md-${mdt++}`, type: 'MD', role: 'EP MD', site: 'EP Lab',
      supervises: [], isSolo: false,
      notes: 'EP Lab MD supervising procedure CRNAs.' + (cfg.epTEE ? ' DCCV/TEE room active.' : ''),
    })
    for (let i = 0; i < procRooms; i++) {
      const c = push({ id: `crna-${crt++}`, type: 'CRNA', role: `EP ${i + 1}`, site: 'EP Lab', supervisedBy: epMD.id })
      epMD.supervises.push(c.id)
      epCRNAs.push(c)
    }
    if (cfg.epTEE) {
      const teeC = push({
        id: `crna-${crt++}`, type: 'CRNA', role: 'DCCV/TEE', site: 'EP Lab',
        supervisedBy: epMD.id, isTEE: true,
        notes: 'Dedicated DCCV/TEE CRNA. Available for break relief between cases.',
      })
      epMD.supervises.push(teeC.id)
      epCRNAs.push(teeC)
    }
    if (epMD.supervises.length === 0) epMD.isSolo = true
  }

  // ── APC ──
  const apcMDs = [], apcCRNAs = []
  if (cfg.apc > 0) {
    const crnasSoFar = asgn.filter((a) => a.type === 'CRNA').length
    const crnaForMainOR = cfg.mainOR + cfg.addOnRooms
    const crnaForFloats = 3
    const crnaEstNeeded = crnasSoFar + crnaForMainOR + crnaForFloats
    const crnaAvailForAPC = Math.max(0, avail.crnas - crnaEstNeeded)

    if (crnaAvailForAPC >= cfg.apc && !mdTight) {
      const supMD = push({ id: `md-${mdt++}`, type: 'MD', role: 'APC Supv', site: 'APC', supervises: [], isSolo: false, notes: 'APC supervising MD. 1:3 optimal ratio.' })
      apcMDs.push(supMD)
      const soloMD = push({ id: `md-${mdt++}`, type: 'MD', role: 'APC Solo', site: 'APC', supervises: [], isSolo: true, notes: 'APC solo MD. Covers 1 room independently.' })
      apcMDs.push(soloMD)
      const crnaCount = Math.min(cfg.apc - 1, 3)
      for (let i = 0; i < crnaCount; i++) {
        const c = push({ id: `crna-${crt++}`, type: 'CRNA', role: `APC ${i + 1}`, site: 'APC', supervisedBy: supMD.id })
        supMD.supervises.push(c.id)
        apcCRNAs.push(c)
      }
    } else if (crnaAvailForAPC >= cfg.apc) {
      const supMD = push({ id: `md-${mdt++}`, type: 'MD', role: 'APC Supv', site: 'APC', supervises: [], isSolo: false, notes: `APC supervising MD. 1:${cfg.apc} ratio (MD conservation mode).` })
      apcMDs.push(supMD)
      for (let i = 0; i < cfg.apc; i++) {
        const c = push({ id: `crna-${crt++}`, type: 'CRNA', role: `APC ${i + 1}`, site: 'APC', supervisedBy: supMD.id })
        supMD.supervises.push(c.id)
        apcCRNAs.push(c)
      }
    } else {
      for (let i = 0; i < cfg.apc; i++) {
        apcMDs.push(push({ id: `md-${mdt++}`, type: 'MD', role: `APC MD ${i + 1}`, site: 'APC', supervises: [], isSolo: true, notes: 'APC solo MD (CRNAs unavailable).' }))
      }
    }
  }

  // ── Main OR ──
  const totalORs = cfg.mainOR + cfg.addOnRooms
  const orMDs = [], orCRNAs = []

  if (totalORs > 0) {
    const supMDsWithout8101 = Math.max(1, Math.ceil(totalORs / 3))
    let rooms8101 = 0
    const supMDsWith1 = Math.max(1, Math.ceil((totalORs - 1) / 3))
    const supMDsWith2 = Math.max(1, Math.ceil((totalORs - 2) / 3))

    if (totalORs >= 2 && supMDsWith2 < supMDsWithout8101) rooms8101 = 2
    else if (totalORs >= 1 && supMDsWith1 < supMDsWithout8101) rooms8101 = 1

    const actualSupMDs = rooms8101 > 0 ? Math.max(1, Math.ceil((totalORs - rooms8101) / 3)) : supMDsWithout8101

    for (let i = 0; i < actualSupMDs; i++) {
      orMDs.push(push({ id: `md-${mdt++}`, type: 'MD', role: `OR Supv ${i + 1}`, site: 'Main OR', supervises: [], isSolo: false, notes: 'Main OR supervision. 1:3 target ratio.' }))
    }

    for (let i = 0; i < totalORs; i++) {
      const label = i < cfg.mainOR ? `OR ${i + 1}` : `Add-On ${i - cfg.mainOR + 1}`
      const c = push({ id: `crna-${crt++}`, type: 'CRNA', role: label, site: 'Main OR', supervisedBy: null, isAddOn: i >= cfg.mainOR })
      orCRNAs.push(c)
    }

    let ci = 0
    for (let i = 0; i < rooms8101 && ci < orCRNAs.length; i++) {
      orCRNAs[ci].supervisedBy = md8101.id
      md8101.supervises.push(orCRNAs[ci].id)
      md8101.isSolo = false
      ci++
    }
    if (rooms8101 > 0) md8101.notes = `Carrying ${rooms8101} OR room${rooms8101 > 1 ? 's' : ''} to optimize staffing. Still available for emergencies.`

    let mi = 0
    while (ci < orCRNAs.length) {
      const md = orMDs[mi % orMDs.length]
      orCRNAs[ci].supervisedBy = md.id
      md.supervises.push(orCRNAs[ci].id)
      ci++; mi++
    }
  }

  // ── IR ──
  let irProvider = null
  if (cfg.ir) {
    const allSupMDs = [...orMDs]
    if (md8101.supervises.length > 0 && md8101.supervises.length < 3) allSupMDs.push(md8101)
    const avMD = allSupMDs.find((m) => m.supervises.length < 4)
    if (avMD) {
      irProvider = push({ id: `crna-${crt++}`, type: 'CRNA', role: 'IR CRNA', site: 'IR', supervisedBy: avMD.id })
      avMD.supervises.push(irProvider.id)
    } else {
      irProvider = push({ id: `md-${mdt++}`, type: 'MD', role: 'IR MD', site: 'IR', supervises: [], isSolo: true, notes: 'IR solo — no OR MD capacity.' })
    }
  }

  // ── Floats ──
  const mdsSoFar = asgn.filter((a) => a.type === 'MD').length
  const crnasSoFar = asgn.filter((a) => a.type === 'CRNA').length
  const crnaRemaining = Math.max(0, avail.crnas - crnasSoFar)
  let mdRemaining = Math.max(0, avail.mds - mdsSoFar)

  const floats = []
  const minFloats = 3
  let crnaFloats = Math.min(crnaRemaining, minFloats)
  let mdFloats = 0
  if (crnaFloats < minFloats && mdRemaining > 0) {
    mdFloats = Math.min(mdRemaining, minFloats - crnaFloats)
    mdRemaining -= mdFloats
  }
  const extraCRNAFloats = crnaRemaining - crnaFloats
  if (extraCRNAFloats > 0) crnaFloats += extraCRNAFloats
  if (mdRemaining > 0) { mdFloats += mdRemaining; mdRemaining = 0 }

  for (let i = 0; i < crnaFloats; i++) {
    floats.push(push({ id: `crna-${crt++}`, type: 'CRNA', role: `Float ${i + 1}`, site: 'Float', supervisedBy: null, isFloat: true, notes: 'Break relief, lunch coverage, contingency response. 8101 assigns.' }))
  }
  for (let i = 0; i < mdFloats; i++) {
    floats.push(push({ id: `md-${mdt++}`, type: 'MD', role: `Float MD ${i + 1}`, site: 'Float', supervises: [], isSolo: true, isFloat: true, notes: 'MD float — breaks, add-ons, emergencies. Covers solo.' }))
  }

  // ── Final deficit repair ──
  let totalCRNAsNow = asgn.filter((a) => a.type === 'CRNA').length
  let totalMDsNow = asgn.filter((a) => a.type === 'MD').length
  let crnaOver = totalCRNAsNow - avail.crnas
  let mdAvailStill = avail.mds - totalMDsNow

  while (crnaOver > 0 && mdAvailStill > 0) {
    const crnaFloat = floats.find((f) => f.type === 'CRNA')
    if (!crnaFloat) break
    const idx = asgn.indexOf(crnaFloat)
    if (idx >= 0) asgn.splice(idx, 1)
    const fi = floats.indexOf(crnaFloat)
    if (fi >= 0) floats.splice(fi, 1)
    const newMDFloat = push({ id: `md-${mdt++}`, type: 'MD', role: 'Float MD', site: 'Float', supervises: [], isSolo: true, isFloat: true, notes: 'MD float (converted from CRNA float to resolve deficit).' })
    floats.push(newMDFloat)
    totalCRNAsNow--; totalMDsNow++; crnaOver--; mdAvailStill--
  }

  // ── Contingencies ──
  if (floats.length > 0) {
    const traumaFloat = floats.find((f) => f.type === 'CRNA') || floats[0]
    const traumaSup = traumaFloat.type === 'CRNA'
      ? (orMDs.length > 0 ? orMDs.sort((a, b) => a.supervises.length - b.supervises.length)[0] : md8101)
      : traumaFloat
    contingencies.push({ fromId: traumaSup.id, toId: traumaFloat.id, type: 'trauma', label: 'Trauma OR (30-40%)' })
  }
  {
    const emergFloat = floats.find((f) => f.type === 'CRNA') || floats.find((f) => f.type === 'MD') || md8101
    contingencies.push({ fromId: obMD.id, toId: emergFloat.id, type: 'emergCS', label: 'Emergency C-section (30%)' })
  }
  if (cfg.epTEE && floats.length > 0) {
    const teeFloat = floats[0]
    contingencies.push({ fromId: epMD ? epMD.id : md8101.id, toId: teeFloat.id, type: 'epTEE', label: 'DCCV/TEE float backup' })
  }
  if (cfg.epTEE) {
    const teeCRNA = asgn.find((a) => a.isTEE)
    if (teeCRNA) contingencies.push({ fromId: teeCRNA.id, toId: teeCRNA.id, type: 'teeBreaks', label: 'DCCV/TEE → Break relief between cases' })
  }
  if (cfg.addOnRooms > 0) {
    const addOnCRNA = asgn.find((a) => a.isAddOn)
    if (addOnCRNA) contingencies.push({ fromId: md8101.id, toId: addOnCRNA.id, type: 'addOnFlex', label: 'Add-on → Breaks if unused' })
  }

  // ── Notes & Break Analysis ──
  const mds = asgn.filter((a) => a.type === 'MD')
  const crnas = asgn.filter((a) => a.type === 'CRNA')
  const totalFloats = floats.length
  const mdFloatCount = floats.filter((f) => f.type === 'MD').length
  const crnaFloatCount = floats.filter((f) => f.type === 'CRNA').length
  const notes = []

  if (md8101.supervises.length > 0) notes.push(`📋 8101 supervising ${md8101.supervises.length} OR room${md8101.supervises.length > 1 ? 's' : ''} to optimize staffing. Still available for emergencies.`)
  if (md8101.supervises.length === 0) notes.push('✅ 8101 free — available for emergencies, traumas, epidurals.')
  if (cfg.cardiac > 0) notes.push(`❤️ ${cfg.cardiac} cardiac room${cfg.cardiac > 1 ? 's' : ''} — solo cardiac anesthesiologists.`)
  if (cfg.apc > 0 && apcCRNAs.length === 0) notes.push('⚠️ APC staffed with solo MDs — no CRNAs available.')
  if (cfg.apc > 0 && apcCRNAs.length > 0 && apcMDs.length === 2) notes.push(`🏥 APC: 1 supervising MD (1:${apcCRNAs.length}) + 1 solo MD.`)
  if (cfg.apc > 0 && apcCRNAs.length > 0 && apcMDs.length === 1) notes.push(`🏥 APC: 1 MD supervising ${apcCRNAs.length} CRNAs (1:${apcCRNAs.length}) — MD conservation mode.`)
  if (cfg.mainOR + cfg.addOnRooms >= 7) notes.push(`⚠️ High Main OR volume — ${cfg.mainOR + cfg.addOnRooms} rooms.`)
  if (cfg.addOnRooms > 0) notes.push(`📌 ${cfg.addOnRooms} add-on room${cfg.addOnRooms > 1 ? 's' : ''} (${cfg.mainOR} scheduled + ${cfg.addOnRooms} add-on = ${cfg.mainOR + cfg.addOnRooms} total).`)
  if (cfg.ep > 0) notes.push(`⚡ EP Lab: ${cfg.ep} room${cfg.ep > 1 ? 's' : ''}${cfg.epTEE ? ' (includes DCCV/TEE)' : ''}.`)
  if (cfg.epTEE) notes.push('☕ DCCV/TEE CRNA available for break relief between cases.')
  if (cfg.endo > 0) notes.push(`🔬 Endo: ${cfg.endo} room${cfg.endo > 1 ? 's' : ''} under dedicated Endo MD.`)
  if (cfg.ir) notes.push('📋 IR case booked today.')
  if (cfg.csections >= 1) notes.push(`👶 ${cfg.csections} C-section${cfg.csections > 1 ? 's' : ''} scheduled.`)
  if (cfg.csections >= 4) notes.push('🔴 High OB volume — strongly consider dedicated second OB provider.')
  notes.push('🔴 Trauma OR (30-40%): Float provider responds.')
  if (totalFloats < 3) notes.push(`🔴 Only ${totalFloats} float${totalFloats !== 1 ? 's' : ''} — below minimum of 3. Contingency coverage compromised.`)
  if (totalFloats >= 3) notes.push(`✅ ${totalFloats} float${totalFloats !== 1 ? 's' : ''} available — ${crnaFloatCount} CRNA${crnaFloatCount !== 1 ? 's' : ''} + ${mdFloatCount} MD${mdFloatCount !== 1 ? 's' : ''} (minimum 3 met).`)
  if (mdFloatCount > 0) notes.push(`🩺 ${mdFloatCount} MD float${mdFloatCount > 1 ? 's' : ''} — surplus MDs covering break/contingency roles.`)

  // ── Break Coverage ──
  const provNeedingBreaks = asgn.filter((a) =>
    !a.isFloat && a.site !== 'Float' && !a.is8101 &&
    (a.type === 'CRNA' || (a.type === 'MD' && a.isSolo && !a.isCardiac))
  )
  const breakDemand = provNeedingBreaks.length
  const bkFloats = floats.length * 5
  const bkTEE = cfg.epTEE ? 2 : 0
  const bk8101 = 1
  const bkOB = 1
  const bkEP = cfg.ep > 0 ? 1 : 0
  const supMDsWith3 = mds.filter((m) => !m.is8101 && !m.isSolo && !m.isCardiac && m.supervises && m.supervises.length >= 3).length
  const bkSupMDs = supMDsWith3

  const breakSources = [
    { label: 'Floats', count: floats.length, breaks: bkFloats, detail: `${floats.length} × 5` },
    ...(bkTEE > 0 ? [{ label: 'DCCV/TEE CRNA', count: 1, breaks: bkTEE, detail: 'between cases' }] : []),
    { label: '8101', count: 1, breaks: bk8101, detail: 'schedule runner' },
    { label: 'OB MD', count: 1, breaks: bkOB, detail: 'between cases' },
    ...(bkEP > 0 ? [{ label: 'EP MD', count: 1, breaks: bkEP, detail: 'between cases' }] : []),
    ...(bkSupMDs > 0 ? [{ label: 'Supv MDs (≥1:3)', count: supMDsWith3, breaks: bkSupMDs, detail: `${supMDsWith3} × 1` }] : []),
  ]

  const breakCapacity = bkFloats + bkTEE + bk8101 + bkOB + bkEP + bkSupMDs
  const breakGap = breakDemand - breakCapacity
  const breakPct = breakDemand > 0 ? Math.round((breakCapacity / breakDemand) * 100) : 100

  const breakAnalysis = {
    demand: breakDemand, capacity: breakCapacity, sources: breakSources,
    gap: breakGap, pct: Math.min(breakPct, 100),
    severity: breakPct >= 100 ? 'ok' : breakPct >= 75 ? 'tight' : breakPct >= 50 ? 'warning' : 'critical',
    unrelieved: Math.max(0, breakGap),
  }

  notes.push('── BREAK COVERAGE ──')
  breakSources.forEach((s) => notes.push(`  ☕ ${s.label}: ${s.breaks} break${s.breaks !== 1 ? 's' : ''} (${s.detail})`))
  notes.push(`  📊 Total: ${breakCapacity} break slots for ${breakDemand} providers needing breaks`)
  if (breakAnalysis.severity === 'ok') notes.push(`  ✅ Coverage sufficient (${breakPct}%).`)
  if (breakAnalysis.severity === 'tight') notes.push(`  ⚠️ Coverage tight (${breakPct}%). Some breaks may be delayed.`)
  if (breakAnalysis.severity === 'warning') notes.push(`  🔴 Coverage strained (${breakPct}%). ${breakAnalysis.unrelieved} providers may not get timely breaks.`)
  if (breakAnalysis.severity === 'critical') notes.push(`  🚨 CRITICAL (${breakPct}%). ${breakAnalysis.unrelieved} providers will not get breaks without pulling coverage.`)

  return { mds, crnas, totalMDs: mds.length, totalCRNAs: crnas.length, totalStaff: mds.length + crnas.length, assignments: asgn, notes, contingencies, breakAnalysis }
}
