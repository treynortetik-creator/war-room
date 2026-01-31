'use client'

import { useState, useEffect } from 'react'
import ClockStatusBar from '@/components/ClockStatusBar'
import MissionBrief from '@/components/MissionBrief'
import ActiveOps from '@/components/ActiveOps'
import IntelFeed from '@/components/IntelFeed'
import FitnessTracker from '@/components/FitnessTracker'
import AppFleetStatus from '@/components/AppFleetStatus'
import VirgilStatus from '@/components/VirgilStatus'

interface Task {
  id: string
  title: string
  columnId: string
  priority?: string
  dueDate?: string
  subtasks?: { title: string; completed: boolean }[]
}

interface Brief {
  id: string
  title: string
  date: string
  sections: { title: string; items: { text: string; type?: string }[] }[]
}

export default function WarRoom() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, briefsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/briefs'),
        ])
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
        if (briefsRes.ok) {
          const briefsData = await briefsRes.json()
          setBriefs(briefsData)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // refresh every 5 min
    return () => clearInterval(interval)
  }, [])

  const inProgressTasks = tasks.filter(t => t.columnId === 'in-progress')
  const latestBrief = briefs.length > 0 ? briefs[0] : null

  return (
    <main className="min-h-screen p-4 md:p-6 relative">
      {/* Top Status Bar */}
      <div className="opacity-0 animate-fade-in mb-6">
        <ClockStatusBar />
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="opacity-0 animate-fade-in-delay-1">
          <MissionBrief />
        </div>
        <div className="opacity-0 animate-fade-in-delay-2">
          <ActiveOps tasks={inProgressTasks} loading={loading} />
        </div>
        <div className="opacity-0 animate-fade-in-delay-3">
          <IntelFeed brief={latestBrief} loading={loading} />
        </div>
      </div>

      {/* Bottom 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="opacity-0 animate-fade-in-delay-3">
          <FitnessTracker />
        </div>
        <div className="opacity-0 animate-fade-in-delay-4">
          <AppFleetStatus />
        </div>
        <div className="opacity-0 animate-fade-in-delay-5">
          <VirgilStatus />
        </div>
      </div>

      {/* Classification footer */}
      <div className="mt-6 text-center opacity-0 animate-fade-in-delay-5">
        <p className="text-war-muted text-xs font-mono tracking-[0.3em] uppercase">
          ▰ Classification: Eyes Only — Tetik, T. ▰
        </p>
      </div>
    </main>
  )
}
