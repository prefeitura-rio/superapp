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
const EVICT_BATCH = 1_000

export type GoogleMapsScope = 'address_autocomplete' | 'cep_lookup'

const hits = new Map<string, number[]>()

const noStore = { 'Cache-Control': 'private, no-store' }

/**
 * The first X-Forwarded-For value is whatever the client declares; the Envoy
 * only appends hops to the right. Trust what the mesh saw instead:
 * `x-envoy-external-address`, written by Istio from the connection, or else
 * the last hop, appended by the ingress itself (same rule as
 * `src/actions/divida-ativa/enviar-requerimento.ts`).
 */
export function googleMapsClientIp(request: Request): string {
  const fromMesh = request.headers.get('x-envoy-external-address')?.trim()
  if (fromMesh) return fromMesh

  const lastHop = request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .pop()
    ?.trim()
  if (lastHop) return lastHop

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Keeps the counter bounded: drops the clients without a hit in the window
 * and, if it is still full, the oldest tracked ones. Runs only when the cap
 * is reached, so a request does not walk the whole map.
 */
function makeRoom(now: number) {
  for (const [key, times] of hits) {
    if (!times.some(at => now - at < WINDOW_MS)) hits.delete(key)
  }

  if (hits.size < MAX_TRACKED_CLIENTS) return

  let toEvict = hits.size - MAX_TRACKED_CLIENTS + EVICT_BATCH
  for (const key of hits.keys()) {
    if (toEvict <= 0) break
    hits.delete(key)
    toEvict--
  }
}

/** Per-process limit. A second pod does not see this counter. */
export function allowGoogleMapsRequest(
  scope: GoogleMapsScope,
  ip: string,
  now = Date.now()
): boolean {
  const key = `${scope}:${ip}`
  if (!hits.has(key) && hits.size >= MAX_TRACKED_CLIENTS) makeRoom(now)

  const recent = (hits.get(key) ?? []).filter(at => now - at < WINDOW_MS)
  // Re-inserting moves the client to the end, so eviction drops the least
  // recently seen first.
  hits.delete(key)
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
