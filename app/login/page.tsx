'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          router.replace('/')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.replace('/')
      } else {
        setError('ACCESS DENIED — INVALID CREDENTIALS')
        setPassword('')
      }
    } catch {
      setError('COMMS FAILURE — RETRY')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-war-muted font-mono text-sm animate-pulse">
          VERIFYING CLEARANCE...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="war-panel">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-war-accent text-2xl font-mono mb-2">&#9670;</div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-war-accent glow-text font-display">
              The War Room
            </h1>
            <p className="text-war-muted text-xs font-mono tracking-wider mt-1">
              AUTHENTICATION REQUIRED
            </p>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-war-border to-transparent" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-war-muted text-xs font-mono tracking-wider mb-2 uppercase"
              >
                Access Code
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                maxLength={256}
                className="w-full bg-war-bg border border-war-border rounded px-3 py-2.5 text-war-text font-mono text-sm focus:outline-none focus:border-war-accent focus:ring-1 focus:ring-war-accent/30 transition-colors placeholder:text-war-muted/40"
                placeholder="Enter access code..."
              />
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-900/20 border border-red-800/40 rounded text-red-400 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 rounded border border-war-accent/60 bg-war-accent/10 text-war-accent font-mono text-sm tracking-wider uppercase hover:bg-war-accent/20 hover:border-war-accent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-war-muted/50 text-[10px] font-mono tracking-[0.3em] uppercase">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
