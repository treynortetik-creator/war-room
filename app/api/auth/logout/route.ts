import { NextResponse } from 'next/server'
import { getSessionToken, destroySession, SESSION_COOKIE } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const token = await getSessionToken()
  if (token) {
    destroySession(token)
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
