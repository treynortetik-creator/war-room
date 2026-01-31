import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { requireAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getVirgilStats() {
  const sessionsDir = join(homedir(), '.clawdbot', 'agents', 'main', 'sessions')

  let files: string[]
  try {
    files = readdirSync(sessionsDir)
  } catch {
    return { tasksToday: 0, subagentsSpawned: 0, uptimeStr: '0h 0m' }
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
    const stats = getVirgilStats()

    return NextResponse.json({
      status: 'Active',
      tasksToday: stats.tasksToday,
      subagentsSpawned: stats.subagentsSpawned,
      uptime: stats.uptimeStr,
    })
  } catch (err) {
    console.error('Virgil API error:', err)
    return NextResponse.json({
      status: 'Active',
      tasksToday: 0,
      subagentsSpawned: 0,
      uptime: '0h 0m',
    })
  }
}
