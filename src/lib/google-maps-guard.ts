import { isJwtExpired } from '@/lib/jwt-utils'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Guard for the routes that proxy the paid Google Maps APIs with
 * GOOGLE_MAPS_API_KEY. Only the logged-in address screen uses them, so an
 * anonymous caller is refused, and each client IP gets a request budget per
 * minute so a session cannot be used to drain the key's quota.
 */

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const MAX_TRACKED_CLIENTS = 10_000

export type GoogleMapsScope = 'address_autocomplete' | 'cep_lookup'

const hits = new Map<string, number[]>()

const noStore = { 'Cache-Control': 'private, no-store' }

export function googleMapsClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function pruneStale(now: number) {
  for (const [key, times] of hits) {
    if (!times.some(at => now - at < WINDOW_MS)) hits.delete(key)
  }
}

/** Per-process limit. A second pod does not see this counter. */
export function allowGoogleMapsRequest(
  scope: GoogleMapsScope,
  ip: string,
  now = Date.now()
): boolean {
  if (hits.size >= MAX_TRACKED_CLIENTS) pruneStale(now)

  const key = `${scope}:${ip}`
  const recent = (hits.get(key) ?? []).filter(at => now - at < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)
  return true
}

export function hasValidSession(request: NextRequest): boolean {
  const token = request.cookies.get('access_token')?.value
  if (!token) return false
  return !isJwtExpired(token)
}

/**
 * Returns the response that refuses the request (401 without a session, 429
 * over the limit), or null when the route may call Google.
 */
export function guardGoogleMapsRequest(
  request: NextRequest,
  scope: GoogleMapsScope
): NextResponse | null {
  if (!hasValidSession(request)) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401, headers: noStore }
    )
  }

  if (!allowGoogleMapsRequest(scope, googleMapsClientIp(request))) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { ...noStore, 'Retry-After': String(WINDOW_MS / 1000) },
      }
    )
  }

  return null
}
