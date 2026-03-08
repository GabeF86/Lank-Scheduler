import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

/**
 * Verifies the Clerk JWT from Authorization header.
 * Attaches req.auth = { userId, orgId, orgRole } on success.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const payload = await clerk.verifyToken(token)
    req.auth = {
      userId: payload.sub,
      orgId: payload.org_id,
      orgRole: payload.org_role,
    }
    next()
  } catch {
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
