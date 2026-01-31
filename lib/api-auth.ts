import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './auth'

const SESSION_COOKIE = 'warroom_session'

/**
 * Validates the session from request cookies.
 * Returns null if authenticated, or a 401 NextResponse if not.
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token || !validateSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
