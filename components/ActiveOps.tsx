'use client'

interface Task {
  id: string
  title: string
  columnId: string
  priority?: string
  dueDate?: string
  subtasks?: { title: string; completed: boolean }[]
}

const priorityBadge: Record<string, string> = {
  critical: 'badge badge-critical',
  high: 'badge badge-high',
  medium: 'badge badge-medium',
  low: 'badge badge-low',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `${diff}d remaining`
}

export default function ActiveOps({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  return (
    <div className="war-panel h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Active Ops
          </h2>
        </div>
        <span className="text-xs font-mono text-war-muted px-2 py-0.5 bg-war-border/30 rounded">
          {tasks.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 border-2 border-war-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-war-muted text-xs font-mono">Fetching SITREP data...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-war-muted text-3xl">◇</span>
            <span className="text-war-muted text-xs font-mono">No active operations</span>
            <span className="text-war-muted/50 text-xs font-mono italic">All quiet on the western front</span>
          </div>
        ) : (
          tasks.map((task) => {
            const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
            const totalSubtasks = task.subtasks?.length || 0
            const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

            return (
              <div
                key={task.id}
                className="p-3 rounded border border-war-border/50 hover:border-war-glow/50 transition-all duration-300 bg-war-bg/30"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-mono text-war-text leading-tight flex-1">
                    {task.title}
                  </h3>
                  {task.priority && (
                    <span className={priorityBadge[task.priority] || 'badge'}>
                      {task.priority?.toUpperCase()}
                    </span>
                  )}
                </div>

                {task.dueDate && (
                  <div className="text-xs font-mono text-war-muted mb-2">
                    ⏱ {formatDate(task.dueDate)}
                  </div>
                )}

                {totalSubtasks > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] font-mono text-war-muted mb-1">
                      <span>Subtasks</span>
                      <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    <div className="w-full h-1.5 bg-war-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-war-accent rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="text-xs font-mono text-war-muted text-center">
          Source: SITREP · Auto-refresh: 5min
        </div>
      </div>
    </div>
  )
}
