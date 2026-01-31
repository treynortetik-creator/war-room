'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClockStatusBar from '@/components/ClockStatusBar'
import MissionBrief from '@/components/MissionBrief'
import ActiveOps from '@/components/ActiveOps'
import IntelFeed from '@/components/IntelFeed'
import ThreatBoard from '@/components/ThreatBoard'
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
  const [showFitness, setShowFitness] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, briefsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/briefs'),
        ])

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || [])
        }
        if (briefsRes.ok) {
          const briefsData = await briefsRes.json()
          setBriefs(Array.isArray(briefsData) ? briefsData : briefsData.briefs || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const inProgressTasks = tasks.filter(t => t.columnId === 'in-progress')
  const latestBrief = briefs.length > 0 ? briefs[0] : null

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6 relative">
      {/* Top Status Bar */}
      <div className="opacity-0 animate-fade-in mb-4 md:mb-6">
        <ClockStatusBar />
      </div>

      {/* Row 2: MissionBrief | ActiveOps | IntelFeed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
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

      {/* Row 3: ThreatBoard | AppFleetStatus | VirgilStatus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="opacity-0 animate-fade-in-delay-3">
          <ThreatBoard />
        </div>
        <div className="opacity-0 animate-fade-in-delay-4">
          <AppFleetStatus />
        </div>
        <div className="opacity-0 animate-fade-in-delay-5">
          <VirgilStatus />
        </div>
      </div>

      {/* Collapsible Fitness Tracker */}
      <div className="mt-4 md:mt-6 opacity-0 animate-fade-in-delay-5">
        <button
          onClick={() => setShowFitness(!showFitness)}
          className="w-full py-2 px-4 rounded border border-war-border/50 hover:border-war-glow/50 bg-war-panel/50 text-xs font-mono text-war-muted hover:text-war-text transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span className={`transition-transform duration-300 text-war-accent ${showFitness ? 'rotate-180' : ''}`}>
            &#9662;
          </span>
          Physical Training Tracker
          <span className={`transition-transform duration-300 text-war-accent ${showFitness ? 'rotate-180' : ''}`}>
            &#9662;
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showFitness ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}>
          <div className="max-w-md mx-auto">
            <FitnessTracker />
          </div>
        </div>
      </div>

      {/* Classification footer */}
      <div className="mt-4 md:mt-6 text-center opacity-0 animate-fade-in-delay-5 flex items-center justify-center gap-4">
        <p className="text-war-muted text-xs font-mono tracking-[0.3em] uppercase">
          &#9646; Classification: Eyes Only — Tetik, T. &#9646;
        </p>
        <button
          onClick={handleLogout}
          className="text-war-muted/40 hover:text-war-red text-[10px] font-mono tracking-wider uppercase transition-colors duration-300"
          title="End session"
        >
          [logout]
        </button>
      </div>
    </main>
  )
}
