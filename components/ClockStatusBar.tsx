'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  "The mission doesn't care about your feelings.",
  "Every day you're not building, someone else is.",
  "Discipline equals freedom. — Jocko Willink",
  "The obstacle is the way. — Marcus Aurelius",
  "Ships are safe in harbor, but that's not what ships are built for.",
  "You're either growing or you're dying. Pick one.",
  "The best time to plant a tree was 20 years ago. The second best time is right now.",
  "Move fast. Break things. Fix them faster.",
  "Fortune favors the bold — and the caffeinated.",
  "Your comfort zone is a beautiful place, but nothing grows there.",
  "If you're the smartest person in the room, you're in the wrong room.",
  "Results happen at the intersection of talent and relentlessness.",
  "Momentum is a hell of a drug.",
  "Build the plane while flying it. That's the startup way.",
  "Today's forecast: 100% chance of execution.",
  "The gap between you and everyone else compounds daily.",
  "Build like nobody's watching. Ship like everybody is.",
  "AI doesn't replace hustle. It multiplies it.",
]

// TODO: Wire up to Google Calendar API instead of hardcoded events
const UPCOMING_EVENTS: { name: string; date: Date }[] = []

export default function ClockStatusBar() {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [nextEvent, setNextEvent] = useState<{ name: string; days: number } | null>(null)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const mst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Phoenix' }))
      
      const hours = mst.getHours().toString().padStart(2, '0')
      const minutes = mst.getMinutes().toString().padStart(2, '0')
      const seconds = mst.getSeconds().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}:${seconds}`)
      
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Phoenix'
      })
      setDate(dateStr)

      // Find next upcoming event
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = UPCOMING_EVENTS
        .map(e => ({ name: e.name, days: Math.ceil((e.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) }))
        .filter(e => e.days > 0)
        .sort((a, b) => a.days - b.days)
      
      setNextEvent(upcoming[0] || null)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="war-panel animate-border-glow">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="text-war-accent text-xl font-mono">◆</div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase text-war-accent glow-text font-display">
              The War Room
            </h1>
            <p className="text-war-muted text-xs font-mono tracking-wider">COMMAND CENTER v1.0</p>
          </div>
        </div>

        {/* Clock */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-war-text glow-green tracking-[0.15em]">
            {time || '--:--:--'}
          </div>
          <div className="text-war-muted text-xs font-mono mt-1 tracking-wider">
            {date || 'Loading...'} · MST
          </div>
        </div>

        {/* Event Countdown + Quote */}
        <div className="text-right max-w-xs">
          {nextEvent && (
            <div className="mb-2">
              <span className="text-war-accent font-mono text-sm font-semibold">{nextEvent.days}</span>
              <span className="text-war-muted text-xs font-mono"> days until </span>
              <span className="text-war-text text-xs font-mono">{nextEvent.name}</span>
            </div>
          )}
          <p className="text-war-muted text-xs italic font-display leading-relaxed transition-opacity duration-1000">
            &ldquo;{QUOTES[quoteIndex]}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
