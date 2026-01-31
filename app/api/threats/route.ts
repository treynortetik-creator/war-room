import { NextResponse } from 'next/server'

export const revalidate = 300

export async function GET() {
  try {
    const apiKey = process.env.SITREP_API_KEY
    if (!apiKey) {
      return NextResponse.json({ tasks: [] })
    }

    const res = await fetch('https://sitrep.up.railway.app/api/tasks', {
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
