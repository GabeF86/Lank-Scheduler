import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import Schedule from '../models/Schedule.js'

const router = Router()

// GET /api/schedules?from=YYYY-MM-DD&to=YYYY-MM-DD
// List schedule dates that exist in a range
router.get('/', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query
    const query = { hospitalId: req.auth.orgId }
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = from
      if (to) query.date.$lte = to
    }
    const schedules = await Schedule.find(query).select('date updatedAt savedBy').lean()
    res.json(schedules)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/schedules/:date
router.get('/:date', requireAuth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ hospitalId: req.auth.orgId, date: req.params.date }).lean()
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' })
    res.json(schedule)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/schedules/:date — create or update (upsert)
router.put('/:date', requireAuth, async (req, res) => {
  try {
    const { config, availability, assignments, notes, contingencies, breakAnalysis } = req.body
    const schedule = await Schedule.findOneAndUpdate(
      { hospitalId: req.auth.orgId, date: req.params.date },
      { config, availability, assignments, notes, contingencies, breakAnalysis, savedBy: req.auth.userId, updatedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    )

    // Broadcast to other clients in this room
    req.io.to(`${req.auth.orgId}-${req.params.date}`).emit('schedule:updated', { date: req.params.date })

    res.json(schedule)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/schedules/:date
router.delete('/:date', requireAuth, async (req, res) => {
  try {
    await Schedule.deleteOne({ hospitalId: req.auth.orgId, date: req.params.date })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
