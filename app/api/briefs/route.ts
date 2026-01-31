import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://mission-control-production-bc9a.up.railway.app/api/briefs', {
      headers: {
        'x-api-key': process.env.SITREP_API_KEY || 'M2icO3BeTJP9uc9oVpjJ16qaW1UlcI0w',
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
