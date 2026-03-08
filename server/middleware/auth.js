import { verifyToken } from '@clerk/backend'

/**
 * Verifies the Clerk JWT from Authorization header.
 * Attaches req.auth = { userId, orgId, orgRole } on success.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: [process.env.CLIENT_URL || 'http://localhost:5173'],
    })
    req.auth = {
      userId: payload.sub,
      orgId: payload.org_id,
      orgRole: payload.org_role,
    }
    next()
  } catch (err) {
    console.error('[requireAuth] token verification failed:', err.message)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Requires the user to have the 'org:admin' role.
 * Must come after requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (req.auth?.orgRole !== 'org:admin') {
    return res.status(403).json({ error: 'Admin role required' })
  }
  next()
}
