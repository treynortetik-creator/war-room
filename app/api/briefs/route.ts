import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

const SITREP_API_URL = process.env.SITREP_API_URL || 'https://sitrep.example.com'

export async function GET(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    const apiKey = process.env.SITREP_API_KEY
    if (!apiKey) {
      return NextResponse.json([], { status: 200 })
    }

    const res = await fetch(`${SITREP_API_URL}/api/briefs`, {
      headers: {
        'x-api-key': apiKey,
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json([], { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
