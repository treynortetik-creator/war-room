'use client'

interface AppInfo {
  name: string
  status: 'live' | 'development' | 'prd' | 'planned'
  statusLabel: string
  lastDeploy?: string
  icon: string
}

const APPS: AppInfo[] = [
  { name: 'FlightLog', status: 'live', statusLabel: 'Live', lastDeploy: 'Jun 2025', icon: '✈️' },
  { name: 'Deckhand', status: 'development', statusLabel: 'Development', lastDeploy: 'In progress', icon: '⚓' },
  { name: 'SITREP', status: 'live', statusLabel: 'Live', lastDeploy: 'Jun 2025', icon: '📋' },
  { name: 'Quartermaster', status: 'prd', statusLabel: 'PRD Complete', icon: '📦' },
  { name: 'Sentinel', status: 'planned', statusLabel: 'Planned', icon: '🛡️' },
  { name: 'Still', status: 'live', statusLabel: 'Live', lastDeploy: 'May 2025', icon: '🥃' },
  { name: 'Counting House', status: 'development', statusLabel: 'Development', lastDeploy: 'In progress', icon: '💰' },
]

const statusDotClass: Record<string, string> = {
  live: 'status-dot-live',
  development: 'status-dot-dev',
  prd: 'status-dot-prd',
  planned: 'status-dot-planned',
}

export default function AppFleetStatus() {
  return (
    <div className="war-panel h-full min-h-[220px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            App Fleet Status
          </h2>
        </div>
        <span className="text-xs font-mono text-war-muted px-2 py-0.5 bg-war-border/30 rounded">
          {APPS.filter(a => a.status === 'live').length} deployed
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {APPS.map((app) => (
          <div
            key={app.name}
            className="flex items-center gap-2 p-2 rounded border border-war-border/30 hover:border-war-glow/40 transition-all duration-300 bg-war-bg/20"
          >
            <span className="text-sm">{app.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`status-dot ${statusDotClass[app.status]}`} />
                <span className="text-xs font-mono text-war-text truncate">{app.name}</span>
              </div>
              <p className="text-[10px] font-mono text-war-muted mt-0.5">
                {app.lastDeploy || app.statusLabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="flex justify-center gap-4 text-[10px] font-mono text-war-muted">
          <span className="flex items-center gap-1"><span className="status-dot status-dot-live" /> Live</span>
          <span className="flex items-center gap-1"><span className="status-dot status-dot-dev" /> Dev</span>
          <span className="flex items-center gap-1"><span className="status-dot status-dot-prd" /> PRD</span>
          <span className="flex items-center gap-1"><span className="status-dot status-dot-planned" /> Planned</span>
        </div>
      </div>
    </div>
  )
}
