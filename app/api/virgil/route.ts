import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { requireAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// In-memory store for remotely-posted stats (Railway deployment)
let remoteStats: {
  tasksToday: number
  subagentsSpawned: number
  uptime: string
  lastUpdated: number
} | null = null

function getLocalVirgilStats() {
  // Points at the local agent runtime's session-log directory.
  // Override via env var; default is a generic placeholder path.
  const sessionsDir = process.env.AGENT_SESSIONS_DIR || join(homedir(), '.agent-runtime', 'sessions')

  let files: string[]
  try {
    files = readdirSync(sessionsDir)
  } catch {
    // Sessions directory doesn't exist — not a local deployment
    return null
  }

  const now = new Date()
  // Use MST timezone for "today" calculation
  const mstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Phoenix' }))
  const todayStart = new Date(mstNow.getFullYear(), mstNow.getMonth(), mstNow.getDate())
  // Convert back to UTC for comparison
  const todayStartUTC = new Date(todayStart.getTime() + (now.getTime() - mstNow.getTime()))

  let tasksToday = 0
  let subagentsSpawned = 0
  let oldestToday: Date | null = null

  for (const file of files) {
    // Count both active (.jsonl) and completed/deleted (.jsonl.deleted.*) session files
    if (!file.includes('.jsonl')) continue

    const filePath = join(sessionsDir, file)
    let stat
    try {
      stat = statSync(filePath)
    } catch {
      continue
    }

    const created = stat.birthtime
    if (created >= todayStartUTC) {
      tasksToday++

      // Deleted sessions are completed subagent sessions
      if (file.includes('.deleted.')) {
        subagentsSpawned++
      }

      if (!oldestToday || created < oldestToday) {
        oldestToday = created
      }
    }
  }

  let uptimeStr = '0h 0m'
  if (oldestToday) {
    const diffMs = now.getTime() - oldestToday.getTime()
    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    uptimeStr = `${hours}h ${minutes}m`
  }

  return { tasksToday, subagentsSpawned, uptimeStr }
}

export async function GET(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    // Try local sessions directory first
    const localStats = getLocalVirgilStats()

    if (localStats) {
      return NextResponse.json({
        status: 'Active',
        tasksToday: localStats.tasksToday,
        subagentsSpawned: localStats.subagentsSpawned,
        uptime: localStats.uptimeStr,
        source: 'local',
      })
    }

    // Remote deployment: use POSTed stats if available
    if (remoteStats) {
      const ageMin = Math.round((Date.now() - remoteStats.lastUpdated) / 60000)
      const stale = ageMin > 30

      return NextResponse.json({
        status: stale ? 'Stale' : 'Remote',
        tasksToday: remoteStats.tasksToday,
        subagentsSpawned: remoteStats.subagentsSpawned,
        uptime: remoteStats.uptime,
        lastUpdated: new Date(remoteStats.lastUpdated).toISOString(),
        source: 'remote',
      })
    }

    // No local sessions, no remote stats posted
    return NextResponse.json({
      status: 'Remote',
      tasksToday: 0,
      subagentsSpawned: 0,
      uptime: '—',
      source: 'remote',
    })
  } catch (err) {
    console.error('Virgil API error:', err)
    return NextResponse.json({
      status: 'Error',
      tasksToday: 0,
      subagentsSpawned: 0,
      uptime: '0h 0m',
    })
  }
}

/**
 * POST handler: Clawdbot can push stats from the local machine to the deployed instance.
 * Body: { tasksToday: number, subagentsSpawned: number, uptime: string }
 */
export async function POST(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()

    remoteStats = {
      tasksToday: typeof body.tasksToday === 'number' ? body.tasksToday : 0,
      subagentsSpawned: typeof body.subagentsSpawned === 'number' ? body.subagentsSpawned : 0,
      uptime: typeof body.uptime === 'string' ? body.uptime : '0h 0m',
      lastUpdated: Date.now(),
    }

    return NextResponse.json({ ok: true, stats: remoteStats })
  } catch (err) {
    console.error('Virgil POST error:', err)
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
