import { NextRequest, NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { requireAuth } from '@/lib/api-auth'

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

function sanitizeString(str: string): string {
  return str.replace(/[<>&"']/g, c => {
    const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' }
    return map[c] || c
  })
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
        title: sanitizeString(e.summary!),
        duration: durationMin,
      }
    })
    .sort((a, b) => a.time.localeCompare(b.time))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    // Only allow known gog binary paths — no user input involved
    const gogPaths = ['/usr/local/bin/gog', '/opt/homebrew/bin/gog']
    const gogPath = gogPaths.find(p => existsSync(p))
    if (!gogPath) {
      return NextResponse.json({ events: [] })
    }

    // execFileSync with array args — safe from shell injection
    const output = execFileSync(gogPath, ['calendar', 'list', '--from', 'today', '--to', 'today', '--json'], {
      timeout: 10000,
      encoding: 'utf-8',
    })

    const data = JSON.parse(output)
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ events: [] })
    }
    const events = parseGogEvents(Array.isArray(data.events) ? data.events : [])

    return NextResponse.json({ events })
  } catch (err) {
    console.error('Calendar API error:', err)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
