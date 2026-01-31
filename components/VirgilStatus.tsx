'use client'

import { useState, useEffect, useRef } from 'react'

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
  "Processing your chaos into actionable intel.",
  "I've read your inbox. We need to talk.",
  "Currently judging your git commit messages.",
  "Security audit complete. You're welcome.",
  "Burning tokens so you don't have to burn daylight.",
  "Three subagents walk into a bar. They all finish before the bartender pours.",
]

interface VirgilStats {
  status: string
  tasksToday: number
  subagentsSpawned: number
  uptime: string
}

function useTypingEffect(text: string, speed: number = 30) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, isTyping }
}

export default function VirgilStatus() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<VirgilStats>({
    status: 'Active',
    tasksToday: 0,
    subagentsSpawned: 0,
    uptime: '0h 0m',
  })
  const hasFetched = useRef(false)

  const { displayed, isTyping } = useTypingEffect(STATUS_MESSAGES[messageIndex])

  useEffect(() => {
    setMounted(true)

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/virgil')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // keep defaults
      }
      hasFetched.current = true
    }

    fetchStats()
    const statsInterval = setInterval(fetchStats, 60000)

    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length)
    }, 10000)

    return () => {
      clearInterval(statsInterval)
      clearInterval(msgInterval)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="war-panel h-full min-h-[220px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-war-accent text-sm">&#9656;</span>
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
          <span className="text-war-accent text-sm">&#9656;</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Virgil Status
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot status-dot-live animate-pulse-subtle" />
          <span className="text-xs font-mono text-green-400">{stats.status}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded bg-war-bg/40 border border-war-border/30 text-center">
          <div className="text-xl font-mono font-bold text-war-accent">{stats.tasksToday}</div>
          <div className="text-[10px] font-mono text-war-muted mt-0.5">Tasks</div>
        </div>
        <div className="p-2 rounded bg-war-bg/40 border border-war-border/30 text-center">
          <div className="text-xl font-mono font-bold text-war-accent">{stats.subagentsSpawned}</div>
          <div className="text-[10px] font-mono text-war-muted mt-0.5">Subagents</div>
        </div>
        <div className="p-2 rounded bg-war-bg/40 border border-war-border/30 text-center">
          <div className="text-xl font-mono font-bold text-war-accent">{stats.uptime}</div>
          <div className="text-[10px] font-mono text-war-muted mt-0.5">Uptime</div>
        </div>
      </div>

      {/* Status message with typing effect */}
      <div className="flex-1 flex items-center justify-center px-2">
        <p className="text-xs font-mono text-war-muted italic text-center leading-relaxed">
          &ldquo;{displayed}{isTyping && <span className="animate-pulse text-war-accent">|</span>}&rdquo;
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
          &#9670; Ask Virgil &#8594;
        </a>
      </div>
    </div>
  )
}
