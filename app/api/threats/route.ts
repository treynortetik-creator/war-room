import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

const SITREP_API_URL = process.env.SITREP_API_URL || 'https://sitrep.example.com'

export const revalidate = 300

export async function GET(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    const apiKey = process.env.SITREP_API_KEY
    if (!apiKey) {
      return NextResponse.json({ tasks: [] })
    }

    const res = await fetch(`${SITREP_API_URL}/api/tasks`, {
      headers: {
        'x-api-key': apiKey,
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ tasks: [] }, { status: res.status })
    }

    const data = await res.json()
    const tasks = Array.isArray(data) ? data : data.tasks || []

    return NextResponse.json({ tasks })
  } catch {
    return NextResponse.json({ tasks: [] }, { status: 500 })
  }
}
