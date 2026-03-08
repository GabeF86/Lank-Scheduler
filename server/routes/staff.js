import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import Staff from '../models/Staff.js'

const router = Router()

// GET /api/staff/me — returns the current user's staff record for this hospital, or 404
router.get('/me', requireAuth, async (req, res) => {
  try {
    const member = await Staff.findOne({ clerkUserId: req.auth.userId, hospitalId: req.auth.orgId }).lean()
    if (!member) return res.status(404).json({ error: 'Not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/staff/sync — upserts the current user's staff record (called from onboarding)
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, type, specialty } = req.body
    const member = await Staff.findOneAndUpdate(
      { clerkUserId: req.auth.userId, hospitalId: req.auth.orgId },
      { firstName, lastName, email, type, specialty, clerkUserId: req.auth.userId, hospitalId: req.auth.orgId },
      { upsert: true, new: true }
    )
    res.json(member)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/staff
router.get('/', requireAuth, async (req, res) => {
  try {
    const staff = await Staff.find({ hospitalId: req.auth.orgId, active: true }).lean()
    res.json(staff)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/staff — admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, type, specialty } = req.body
    const member = await Staff.create({ hospitalId: req.auth.orgId, firstName, lastName, email, type, specialty })
    req.io.to(req.auth.orgId).emit('staff:updated')
    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/staff/:id — admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, type, specialty, active } = req.body
    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.auth.orgId },
      { firstName, lastName, email, type, specialty, active },
      { new: true }
    )
    if (!member) return res.status(404).json({ error: 'Staff member not found' })
    req.io.to(req.auth.orgId).emit('staff:updated')
    res.json(member)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/staff/:id — admin only (soft delete)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Staff.findOneAndUpdate({ _id: req.params.id, hospitalId: req.auth.orgId }, { active: false })
    req.io.to(req.auth.orgId).emit('staff:updated')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
