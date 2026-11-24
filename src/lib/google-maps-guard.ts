import { JwksUnavailableError, verifyAccessToken } from '@/lib/keycloak-token'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Guard for the routes that proxy the paid Google Maps APIs with
 * GOOGLE_MAPS_API_KEY. Only the logged-in address screen uses them, so a
 * caller without a verified Identidade Carioca session is refused, and each
 * citizen (`sub` of the verified token) gets a request budget per minute so
 * a session cannot be used to drain the key's quota.
 *
 * The budget is per citizen, not per IP: behind the Google load balancer the
 * Istio gateway does not know the client address, so every citizen would
 * share the proxy's IP, and the first X-Forwarded-For value is forgeable.
 */

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const MAX_TRACKED_CLIENTS = 10_000
const EVICT_BATCH = 1_000

export type GoogleMapsScope = 'address_autocomplete' | 'cep_lookup'

const hits = new Map<string, number[]>()

const noStore = { 'Cache-Control': 'private, no-store' }

/**
 * Keeps the counter bounded: drops the clients without a hit in the window
 * and, if it is still full, the least recently seen ones. Runs only when the
 * cap is reached, so a request does not walk the whole map.
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
  client: string,
  now = Date.now()
): boolean {
  const key = `${scope}:${client}`
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

/**
 * Returns the response that refuses the request (401 without a verified
 * session, 503 when the realm keys cannot be loaded, 429 over the limit), or
 * null when the route may call Google.
 */
export async function guardGoogleMapsRequest(
  request: NextRequest,
  scope: GoogleMapsScope
): Promise<NextResponse | null> {
  let session: Awaited<ReturnType<typeof verifyAccessToken>>
  try {
    session = await verifyAccessToken(
      request.cookies.get('access_token')?.value
    )
  } catch (error) {
    if (!(error instanceof JwksUnavailableError)) throw error
    console.error('Google Maps guard: realm keys unavailable:', error.message)
    return NextResponse.json(
      { error: 'Authentication unavailable' },
      { status: 503, headers: noStore }
    )
  }

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401, headers: noStore }
    )
  }

  if (!allowGoogleMapsRequest(scope, session.sub)) {
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
