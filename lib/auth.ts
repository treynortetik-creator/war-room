import { cookies } from 'next/headers'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'

const SESSION_COOKIE = 'warroom_session'
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24', 10)

// In-memory session store. In production with multiple instances, use Redis or similar.
// For a single-instance personal dashboard, this is sufficient.
const sessions = new Map<string, { expiresAt: number }>()

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.WARROOM_PASSWORD
  if (!expected) return false

  const inputBuf = Buffer.from(input)
  const expectedBuf = Buffer.from(expected)
  if (inputBuf.length !== expectedBuf.length) return false

  return timingSafeEqual(inputBuf, expectedBuf)
}

export function createSession(): string {
  // Clean expired sessions
  const now = Date.now()
  sessions.forEach((val, key) => {
    if (val.expiresAt < now) sessions.delete(key)
  })

  const token = randomBytes(32).toString('hex')
  const hashedToken = hashToken(token)
  sessions.set(hashedToken, {
    expiresAt: now + SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
  })
  return token
}

export function validateSession(token: string): boolean {
  const hashedToken = hashToken(token)
  const session = sessions.get(hashedToken)
  if (!session) return false
  if (session.expiresAt < Date.now()) {
    sessions.delete(hashedToken)
    return false
  }
  return true
}

export function destroySession(token: string): void {
  const hashedToken = hashToken(token)
  sessions.delete(hashedToken)
}

export function getSessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken()
  if (!token) return false
  return validateSession(token)
}

export { SESSION_COOKIE }
