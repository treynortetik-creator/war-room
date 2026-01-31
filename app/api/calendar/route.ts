import { NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { existsSync } from 'fs'

interface GogEvent {
  summary?: string
  start?: { dateTime?: string; date?: string; timeZone?: string }
  end?: { dateTime?: string; date?: string; timeZone?: string }
  eventType?: string
  status?: string
}

interface CalendarEvent {
  time: string
  title: string
  duration: number
  endTime: string
}

function parseGogEvents(events: GogEvent[]): CalendarEvent[] {
  return events
    .filter(e => e.eventType === 'default' && e.status === 'confirmed' && e.summary)
    .filter(e => e.start?.dateTime && e.end?.dateTime)
    .map(e => {
      const start = new Date(e.start!.dateTime!)
      const end = new Date(e.end!.dateTime!)
      const durationMin = Math.round((end.getTime() - start.getTime()) / 60000)

      const time = start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Phoenix',
      })

      const endTime = end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Phoenix',
      })

      return {
        time,
        endTime,
        title: e.summary!,
        duration: durationMin,
      }
    })
    .sort((a, b) => a.time.localeCompare(b.time))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const gogPaths = ['/usr/local/bin/gog', '/opt/homebrew/bin/gog']
    const gogPath = gogPaths.find(p => existsSync(p))
    if (!gogPath) {
      return NextResponse.json({ events: [] })
    }

    const output = execFileSync(gogPath, ['calendar', 'list', '--from', 'today', '--to', 'today', '--json'], {
      timeout: 10000,
      encoding: 'utf-8',
    })

    const data = JSON.parse(output)
    const events = parseGogEvents(data.events || [])

    return NextResponse.json({ events })
  } catch (err) {
    console.error('Calendar API error:', err)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
