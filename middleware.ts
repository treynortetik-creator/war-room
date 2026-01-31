import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'warroom_session'

// Rate limiting for login endpoint (in-memory, per-IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return true
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

// Clean up stale rate limit entries periodically
function cleanupRateLimits() {
  const now = Date.now()
  loginAttempts.forEach((val, key) => {
    if (val.resetAt < now) loginAttempts.delete(key)
  })
}

// Security headers applied to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  return response
}

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/session']
// Static assets and Next.js internals
const STATIC_PREFIXES = ['/_next/', '/favicon.ico']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Periodic cleanup
  if (Math.random() < 0.01) cleanupRateLimits()

  // Rate limit login endpoint
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const ip = getClientIP(request)
    if (!checkRateLimit(ip)) {
      const response = NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 }
      )
      response.headers.set('Retry-After', '900')
      return addSecurityHeaders(response)
    }
  }

  // Allow public paths without auth
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Check session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) {
    return redirectOrReject(request, pathname)
  }

  // Validate session token format (should be 64 hex chars)
  if (!/^[a-f0-9]{64}$/.test(sessionToken)) {
    return redirectOrReject(request, pathname)
  }

  // For middleware we can't access the in-memory session store directly
  // since middleware runs on the edge. We validate format here and
  // let API routes do full session validation.
  // The cookie being httpOnly + secure + sameSite=strict provides strong protection.
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

function redirectOrReject(request: NextRequest, pathname: string): NextResponse {
  // API routes get 401
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return addSecurityHeaders(response)
  }

  // Pages get redirected to login
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl)
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
