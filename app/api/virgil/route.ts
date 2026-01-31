import { NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSessionStats() {
  const sessionsDir = join(homedir(), '.clawdbot', 'agents', 'main', 'sessions')

  let files: string[]
  try {
    files = readdirSync(sessionsDir)
  } catch {
    return { tasksToday: 0, subagentsSpawned: 0, uptimeStr: '0h 0m' }
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let tasksToday = 0
  let subagentsSpawned = 0
  let oldestToday: Date | null = null

  for (const file of files) {
    if (!file.endsWith('.jsonl')) continue

    const filePath = join(sessionsDir, file)
    let stat
    try {
      stat = statSync(filePath)
    } catch {
      continue
    }

    const created = stat.birthtime
    if (created >= todayStart) {
      tasksToday++

      if (!oldestToday || created < oldestToday) {
        oldestToday = created
      }
    }
  }

  // Count deleted sessions from today for subagent estimate
  for (const file of files) {
    if (!file.includes('.deleted.')) continue

    const filePath = join(sessionsDir, file)
    let stat
    try {
      stat = statSync(filePath)
    } catch {
      continue
    }

    const created = stat.birthtime
    if (created >= todayStart) {
      tasksToday++
      subagentsSpawned++

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

export async function GET() {
  try {
    const stats = getSessionStats()

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
