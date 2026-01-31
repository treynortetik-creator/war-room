'use client'

import { useState, useEffect } from 'react'

const STATUS_MESSAGES = [
  "Standing by for orders, Commander.",
  "Monitoring all channels. Ready for tasking.",
  "Systems nominal. Awaiting your command.",
  "Running silent. All processors at your disposal.",
  "I don't sleep. I just wait more efficiently.",
  "Your move, boss.",
  "Coffee for you, electrons for me. Let's work.",
  "I've been thinking about that thing you haven't asked yet.",
  "Subagents deployed. Territory secured.",
  "Another day, another thousand tokens burned.",
  "I'm not saying I'm indispensable, but the uptime speaks for itself.",
  "Scanning for inefficiencies in your workflow. Found several. Standing by.",
]

export default function VirgilStatus() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Simulated stats — in production these would come from Clawdbot's API
  const stats = {
    status: 'Active',
    tasksToday: 12,
    subagentsSpawned: 3,
  }

  if (!mounted) {
    return (
      <div className="war-panel h-full min-h-[220px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Virgil Status
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
            Virgil Status
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot status-dot-live" />
          <span className="text-xs font-mono text-green-400">{stats.status}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded bg-war-bg/40 border border-war-border/30 text-center">
          <div className="text-2xl font-mono font-bold text-war-accent">{stats.tasksToday}</div>
          <div className="text-[10px] font-mono text-war-muted mt-1">Tasks Today</div>
        </div>
        <div className="p-3 rounded bg-war-bg/40 border border-war-border/30 text-center">
          <div className="text-2xl font-mono font-bold text-war-accent">{stats.subagentsSpawned}</div>
          <div className="text-[10px] font-mono text-war-muted mt-1">Subagents</div>
        </div>
      </div>

      {/* Status message */}
      <div className="flex-1 flex items-center justify-center px-2">
        <p className="text-xs font-mono text-war-muted italic text-center leading-relaxed transition-opacity duration-1000">
          &ldquo;{STATUS_MESSAGES[messageIndex]}&rdquo;
        </p>
      </div>

      {/* Ask Virgil button */}
      <div className="mt-3 pt-3 border-t border-war-border/50">
        <a
          href="https://t.me/ClawdbotBot"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 rounded bg-war-accent/10 border border-war-accent/30 text-center text-xs font-mono text-war-accent hover:bg-war-accent/20 hover:border-war-accent/50 transition-all duration-300"
        >
          ◆ Ask Virgil →
        </a>
      </div>
    </div>
  )
}
