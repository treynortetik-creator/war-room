'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekKey(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `warroom-fitness-${now.getFullYear()}-w${weekNum}`
}

function getSarcasticMessage(completed: number, streak: number): string {
  if (completed === 0) return "0 days this week? The dumbbells are filing a missing persons report."
  if (completed === 1) return "1 day? That's technically not zero. Barely."
  if (completed === 2) return "2 days. The gym is starting to recognize your face again."
  if (completed === 3) return "3 days in a row? The garage gym barely recognizes you."
  if (completed === 4) return "4 days. You're becoming a regular. Disgusting. Keep going."
  if (completed === 5) return "5 days?! Someone call the newspapers. This is historic."
  if (completed === 6) return "6 days. Even Jocko would give a slight nod of approval."
  if (completed === 7) return "Perfect week. You absolute machine. Don't let it go to your head."
  if (streak > 14) return `${streak}-day streak. At this point you're just showing off.`
  if (streak > 7) return `${streak}-day streak. The iron respects consistency.`
  return "Keep showing up. That's the whole secret."
}

export default function FitnessTracker() {
  const [completedDays, setCompletedDays] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const key = getWeekKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setCompletedDays(JSON.parse(saved))
      } catch {
        // ignore
      }
    }

    // Calculate streak from stored weeks
    const streakKey = 'warroom-fitness-streak'
    const savedStreak = localStorage.getItem(streakKey)
    if (savedStreak) setStreak(parseInt(savedStreak) || 0)
  }, [])

  const toggleDay = (index: number) => {
    const newDays = [...completedDays]
    newDays[index] = !newDays[index]
    setCompletedDays(newDays)
    
    const key = getWeekKey()
    localStorage.setItem(key, JSON.stringify(newDays))

    // Simple streak: count consecutive completed days ending at today
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday = 0
    let count = 0
    for (let i = dayOfWeek; i >= 0; i--) {
      if (newDays[i]) count++
      else break
    }
    setStreak(count)
    localStorage.setItem('warroom-fitness-streak', count.toString())
  }

  const completedCount = completedDays.filter(Boolean).length

  if (!mounted) {
    return (
      <div className="war-panel h-full min-h-[220px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Physical Training
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="war-panel h-full min-h-[220px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Physical Training
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-war-muted">🔥 {streak}d streak</span>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="flex justify-between gap-2 mb-4">
        {DAYS.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-war-muted">{day}</span>
            <button
              onClick={() => toggleDay(i)}
              className={`workout-box min-w-[44px] min-h-[44px] ${completedDays[i] ? 'completed' : ''}`}
            >
              {completedDays[i] && (
                <span className="text-war-accent text-sm font-bold">✓</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-mono text-war-muted mb-1">
          <span>Weekly Progress</span>
          <span>{completedCount}/7</span>
        </div>
        <div className="w-full h-2 bg-war-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-war-accent to-war-gold rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Sarcastic message */}
      <div className="mt-auto pt-3 border-t border-war-border/50">
        <p className="text-xs font-mono text-war-muted italic text-center leading-relaxed">
          &ldquo;{getSarcasticMessage(completedCount, streak)}&rdquo;
        </p>
      </div>
    </div>
  )
}
