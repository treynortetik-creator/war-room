'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  time: string
  title: string
  duration: number // minutes
}

// Static calendar data — wire up real API later
const TODAY_EVENTS: CalendarEvent[] = [
  { time: '06:00', title: 'Morning Routine & Workout', duration: 90 },
  { time: '08:00', title: 'Deep Work — FlightLog', duration: 120 },
  { time: '10:00', title: 'Stand-up & Planning', duration: 30 },
  { time: '10:30', title: 'Deep Work — SITREP', duration: 150 },
  { time: '13:00', title: 'Lunch Break', duration: 60 },
  { time: '14:00', title: 'Meetings / Calls', duration: 60 },
  { time: '15:00', title: 'Deep Work — War Room', duration: 120 },
  { time: '17:00', title: 'Review & EOD Planning', duration: 30 },
  { time: '17:30', title: 'Family Time', duration: 180 },
]

function getEventStatus(event: CalendarEvent): 'done' | 'in-progress' | 'upcoming' {
  const now = new Date()
  const mst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Phoenix' }))
  const [hours, minutes] = event.time.split(':').map(Number)
  
  const eventStart = new Date(mst)
  eventStart.setHours(hours, minutes, 0, 0)
  
  const eventEnd = new Date(eventStart.getTime() + event.duration * 60000)
  
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
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="war-panel h-full min-h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-war-accent text-sm">▸</span>
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
          Today&apos;s Mission Brief
        </h2>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {TODAY_EVENTS.map((event, i) => {
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
              <span className={`text-sm font-mono flex-1 ${config.text}`}>{event.title}</span>
              <span className={`text-[10px] font-mono tracking-wider ${
                status === 'in-progress' ? 'text-war-accent' : 'text-war-muted'
              }`}>
                {config.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="flex justify-between text-xs font-mono text-war-muted">
          <span>{TODAY_EVENTS.filter(e => getEventStatus(e) === 'done').length}/{TODAY_EVENTS.length} completed</span>
          <span className="text-war-accent">
            {TODAY_EVENTS.find(e => getEventStatus(e) === 'in-progress')?.title || 'All clear'}
          </span>
        </div>
      </div>
    </div>
  )
}
