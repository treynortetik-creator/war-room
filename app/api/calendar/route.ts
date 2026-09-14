import { NextRequest, NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { requireAuth } from '@/lib/api-auth'

const SITREP_API_URL = process.env.SITREP_API_URL || 'https://sitrep.example.com'

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

/**
 * Fallback: extract calendar events from latest SITREP brief.
 * Briefs contain a calendar/schedule section we can parse.
 */
async function getCalendarFromBriefs(): Promise<CalendarEvent[]> {
  const apiKey = process.env.SITREP_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(`${SITREP_API_URL}/api/briefs`, {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    })

    if (!res.ok) return []

    const briefs = await res.json()
    if (!Array.isArray(briefs) || briefs.length === 0) return []

    // Get the latest brief
    const latest = briefs[0]
    const content: string = latest.content || latest.body || latest.text || ''
    if (!content) return []

    // Parse calendar items from brief content
    // Look for time patterns like "09:00" or "9:00 AM" followed by event text
    const events: CalendarEvent[] = []
    const lines = content.split('\n')
    let inCalendarSection = false

    for (const line of lines) {
      const lower = line.toLowerCase()
      // Detect calendar/schedule section headers
      if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('agenda')) {
        inCalendarSection = true
        continue
      }
      // Stop at next section header
      if (inCalendarSection && /^#{1,3}\s/.test(line) && !lower.includes('calendar') && !lower.includes('schedule')) {
        inCalendarSection = false
        continue
      }

      if (!inCalendarSection) continue

      // Match time patterns: "09:00 - 10:00 Event Name" or "9:00 AM Event Name" or "- 09:00 Event"
      const timeMatch = line.match(/(\d{1,2}:\d{2})\s*(?:[-–—]\s*(\d{1,2}:\d{2}))?\s*(?:AM|PM)?\s*[-–—:]\s*(.+)/i)
      if (timeMatch) {
        const time = timeMatch[1].padStart(5, '0')
        const endTime = timeMatch[2] ? timeMatch[2].padStart(5, '0') : ''
        const title = sanitizeString(timeMatch[3].replace(/^\*+|\*+$/g, '').trim())

        let duration = 60 // default 1 hour
        if (endTime) {
          const [sh, sm] = time.split(':').map(Number)
          const [eh, em] = endTime.split(':').map(Number)
          duration = (eh * 60 + em) - (sh * 60 + sm)
          if (duration <= 0) duration = 60
        }

        events.push({
          time,
          endTime: endTime || calculateEndTime(time, duration),
          title,
          duration,
        })
      }
    }

    return events.sort((a, b) => a.time.localeCompare(b.time))
  } catch (err) {
    console.error('Failed to get calendar from briefs:', err)
    return []
  }
}

function calculateEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const totalMin = h * 60 + m + durationMin
  const endH = Math.floor(totalMin / 60) % 24
  const endM = totalMin % 60
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    // Try local gog binary first
    const gogPaths = ['/usr/local/bin/gog', '/opt/homebrew/bin/gog']
    const gogPath = gogPaths.find(p => existsSync(p))

    if (gogPath) {
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
    }

    // Fallback: extract calendar from SITREP briefs
    const events = await getCalendarFromBriefs()
    return NextResponse.json({ events, source: 'briefs' })
  } catch (err) {
    console.error('Calendar API error:', err)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
