import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export function setupSocket(io) {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token'))
      const payload = await clerk.verifyToken(token)
      socket.data.userId = payload.sub
      socket.data.orgId = payload.org_id
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const { orgId } = socket.data

    // Always join the org room (for staff updates)
    if (orgId) socket.join(orgId)

    // Join a specific date room (for schedule updates)
    socket.on('join', (room) => {
      // Validate room format: orgId-YYYY-MM-DD
      if (typeof room === 'string' && room.startsWith(orgId)) {
        socket.join(room)
      }
    })

    // Leave a date room
    socket.on('leave', (room) => {
      socket.leave(room)
    })

    socket.on('disconnect', () => {})
  })
}
