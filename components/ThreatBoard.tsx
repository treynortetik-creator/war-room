'use client'

import { useState, useEffect } from 'react'

interface ThreatTask {
  id: string
  title: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
  dueDate?: string
  columnId?: string
}

const priorityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const priorityBadge: Record<string, string> = {
  critical: 'badge badge-critical',
  high: 'badge badge-high',
  medium: 'badge badge-medium',
  low: 'badge badge-low',
}

const columnLabels: Record<string, string> = {
  'backlog': 'BACKLOG',
  'todo': 'TODO',
  'in-progress': 'IN PROG',
  'review': 'REVIEW',
  'done': 'DONE',
}

function formatDueDate(dateStr: string): { text: string; urgent: boolean } {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, urgent: true }
  if (diff === 0) return { text: 'Due today', urgent: true }
  if (diff === 1) return { text: 'Tomorrow', urgent: true }
  if (diff <= 3) return { text: `${diff}d left`, urgent: true }
  return { text: `${diff}d left`, urgent: false }
}

export default function ThreatBoard() {
  const [tasks, setTasks] = useState<ThreatTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/threats')
        if (res.ok) {
          const data = await res.json()
          const allTasks: ThreatTask[] = Array.isArray(data) ? data : data.tasks || []

          const actionable = allTasks
            .filter(t => t.columnId !== 'done')
            .sort((a, b) => {
              const pa = priorityOrder[a.priority || 'low'] ?? 3
              const pb = priorityOrder[b.priority || 'low'] ?? 3
              if (pa !== pb) return pa - pb
              if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              if (a.dueDate) return -1
              if (b.dueDate) return 1
              return 0
            })
            .slice(0, 8)

          setTasks(actionable)
        }
      } catch (err) {
        console.error('Failed to fetch threats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchThreats()
    const interval = setInterval(fetchThreats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="war-panel h-full min-h-[220px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-war-accent text-sm">&#9656;</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Threat Board
          </h2>
        </div>
        <span className="text-xs font-mono text-war-muted px-2 py-0.5 bg-war-border/30 rounded">
          {tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length} hot
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 border-2 border-war-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-war-muted text-xs font-mono">Scanning threat vectors...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-war-muted text-3xl">&#9737;</span>
            <span className="text-war-muted text-xs font-mono">No active threats</span>
            <span className="text-war-muted/50 text-xs font-mono italic">Perimeter secure</span>
          </div>
        ) : (
          tasks.map(task => {
            const due = task.dueDate ? formatDueDate(task.dueDate) : null

            return (
              <div
                key={task.id}
                className="p-2.5 rounded border border-war-border/50 hover:border-war-glow/50 transition-all duration-300 bg-war-bg/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-mono text-war-text leading-tight flex-1 truncate">
                    {task.title}
                  </h3>
                  {task.priority && (
                    <span className={`${priorityBadge[task.priority] || 'badge'} text-[10px] flex-shrink-0`}>
                      {task.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {task.columnId && (
                    <span className="text-[10px] font-mono text-war-muted">
                      {columnLabels[task.columnId] || task.columnId.toUpperCase()}
                    </span>
                  )}
                  {due && (
                    <span className={`text-[10px] font-mono ${due.urgent ? 'text-war-red' : 'text-war-muted'}`}>
                      {due.text}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="text-xs font-mono text-war-muted text-center">
          Source: SITREP Tasks · Priority-sorted
        </div>
      </div>
    </div>
  )
}
