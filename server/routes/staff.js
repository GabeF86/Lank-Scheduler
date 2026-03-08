import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import Staff from '../models/Staff.js'

const router = Router()

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
    const { name, type, specialty } = req.body
    const member = await Staff.create({ hospitalId: req.auth.orgId, name, type, specialty })
    req.io.to(req.auth.orgId).emit('staff:updated')
    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/staff/:id — admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, type, specialty, active } = req.body
    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.auth.orgId },
      { name, type, specialty, active },
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
