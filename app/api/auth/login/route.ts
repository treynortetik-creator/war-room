import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSession, getSessionCookieConfig } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    const body = await request.json()
    const password = body?.password

    if (typeof password !== 'string' || password.length === 0 || password.length > 256) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 })
    }

    const token = createSession()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(getSessionCookieConfig(token))
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
