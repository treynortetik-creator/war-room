'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  time: string
  title: string
  duration: number
  endTime: string
}

function getEventStatus(event: CalendarEvent): 'done' | 'in-progress' | 'upcoming' {
  const now = new Date()
  const mst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Phoenix' }))
  const [hours, minutes] = event.time.split(':').map(Number)

  const eventStart = new Date(mst)
  eventStart.setHours(hours, minutes, 0, 0)

  const [endH, endM] = event.endTime.split(':').map(Number)
  const eventEnd = new Date(mst)
  eventEnd.setHours(endH, endM, 0, 0)

  if (mst >= eventEnd) return 'done'
  if (mst >= eventStart && mst < eventEnd) return 'in-progress'
  return 'upcoming'
}

const statusConfig = {
  'done': { dot: 'bg-war-muted', text: 'text-war-muted line-through', label: 'DONE' },
  'in-progress': { dot: 'bg-war-accent animate-pulse', text: 'text-war-accent', label: 'ACTIVE' },
  'upcoming': { dot: 'bg-war-glow', text: 'text-war-text', label: 'PENDING' },
}

export default function MissionBrief() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch('/api/calendar')
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        }
      } catch (err) {
        console.error('Failed to fetch calendar:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCalendar()
    const dataInterval = setInterval(fetchCalendar, 5 * 60 * 1000)
    const tickInterval = setInterval(() => setTick(t => t + 1), 60000)
    return () => {
      clearInterval(dataInterval)
      clearInterval(tickInterval)
    }
  }, [])

  const doneCount = events.filter(e => getEventStatus(e) === 'done').length
  const activeEvent = events.find(e => getEventStatus(e) === 'in-progress')

  return (
    <div className="war-panel h-full min-h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-war-accent text-sm">&#9656;</span>
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
          Today&apos;s Mission Brief
        </h2>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 border-2 border-war-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-war-muted text-xs font-mono">Fetching calendar intel...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-war-muted text-3xl">&#9737;</span>
            <span className="text-war-muted text-xs font-mono">No events today</span>
            <span className="text-war-muted/50 text-xs font-mono italic">Clear skies, Commander.</span>
          </div>
        ) : (
          events.map((event, i) => {
            const status = getEventStatus(event)
            const config = statusConfig[status]

            return (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 px-3 rounded transition-all duration-300 ${
                  status === 'in-progress' ? 'bg-war-accent/5 border border-war-accent/20' : 'hover:bg-war-border/20'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                <span className="text-war-muted font-mono text-xs w-12 flex-shrink-0">{event.time}</span>
                <span className={`text-sm font-mono flex-1 truncate ${config.text}`}>{event.title}</span>
                <span className={`text-[10px] font-mono tracking-wider flex-shrink-0 ${
                  status === 'in-progress' ? 'text-war-accent' : 'text-war-muted'
                }`}>
                  {config.label}
                </span>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="flex justify-between text-xs font-mono text-war-muted">
          <span>{events.length > 0 ? `${doneCount}/${events.length} completed` : 'No missions'}</span>
          <span className="text-war-accent truncate ml-2">
            {activeEvent?.title || 'All clear'}
          </span>
        </div>
      </div>
    </div>
  )
}
