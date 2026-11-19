import { type KeyObject, createPublicKey, verify } from 'node:crypto'

/**
 * Verifies an Identidade Carioca (Keycloak) access token on the server: RS256
 * signature against the realm keys (`<base>/certs`, the JWKS endpoint next to
 * `/token`) and expiry. Decoding alone (`jwt-decode`) accepts a token anyone
 * can write by hand; this does not.
 */

const JWKS_TTL_MS = 10 * 60_000
/** A token with an unknown `kid` refetches the keys at most this often. */
const JWKS_MIN_REFRESH_MS = 60_000
const JWKS_TIMEOUT_MS = 5_000

export class JwksUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JwksUnavailableError'
  }
}

export interface VerifiedAccessToken {
  sub: string
  exp: number
}

interface JwksCache {
  keys: Map<string, KeyObject>
  fetchedAt: number
}

let cache: JwksCache | null = null
let inflight: Promise<JwksCache> | null = null

function jwksUrl(): string {
  const base = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL
  if (!base) {
    throw new JwksUnavailableError('Identidade Carioca base URL not set')
  }
  return `${base.replace(/\/+$/, '')}/certs`
}

function parseKeys(body: unknown): Map<string, KeyObject> {
  const keys = new Map<string, KeyObject>()
  const list =
    body && typeof body === 'object' && 'keys' in body
      ? (body as { keys: unknown }).keys
      : null
  if (!Array.isArray(list)) return keys

  for (const jwk of list) {
    if (!jwk || typeof jwk !== 'object') continue
    const { kid, kty, use, n, e } = jwk as Record<string, unknown>
    if (typeof kid !== 'string' || kty !== 'RSA') continue
    if (use !== undefined && use !== 'sig') continue
    if (typeof n !== 'string' || typeof e !== 'string') continue
    try {
      keys.set(kid, createPublicKey({ key: { kty, n, e }, format: 'jwk' }))
    } catch {
      // an unusable key is skipped; tokens signed with it are refused
    }
  }
  return keys
}

async function fetchKeys(now: number): Promise<JwksCache> {
  let res: Response
  try {
    res = await fetch(jwksUrl(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(JWKS_TIMEOUT_MS),
    })
  } catch (error) {
    if (error instanceof JwksUnavailableError) throw error
    throw new JwksUnavailableError('JWKS request failed')
  }
  if (!res.ok) {
    throw new JwksUnavailableError(`JWKS responded ${res.status}`)
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new JwksUnavailableError('JWKS body is not JSON')
  }

  const keys = parseKeys(body)
  if (keys.size === 0) throw new JwksUnavailableError('JWKS has no RSA keys')
  return { keys, fetchedAt: now }
}

async function loadKeys(now: number, force: boolean): Promise<JwksCache> {
  if (cache && !force && now - cache.fetchedAt < JWKS_TTL_MS) return cache
  if (cache && force && now - cache.fetchedAt < JWKS_MIN_REFRESH_MS) {
    return cache
  }

  if (!inflight) {
    inflight = fetchKeys(now)
      .then(fresh => {
        cache = fresh
        return fresh
      })
      .finally(() => {
        inflight = null
      })
  }

  try {
    return await inflight
  } catch (error) {
    // keys fetched earlier still verify while the endpoint is down
    if (cache) return cache
    throw error
  }
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(segment, 'base64url').toString('utf8')
    )
    return value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/**
 * Returns the verified claims, or null for a missing, malformed, forged or
 * expired token. Throws JwksUnavailableError when the realm keys cannot be
 * loaded, so the caller can answer 503 instead of trusting the token.
 */
export async function verifyAccessToken(
  token: string | undefined,
  now = Date.now()
): Promise<VerifiedAccessToken | null> {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerPart, payloadPart, signaturePart] = parts

  const header = decodeSegment(headerPart)
  const payload = decodeSegment(payloadPart)
  if (!header || !payload) return null
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null

  const { exp } = payload
  if (typeof exp !== 'number' || exp * 1000 <= now) return null
  // Keycloak always sets `sub`; `preferred_username` covers a realm that
  // emits lightweight tokens without it.
  const sub = [payload.sub, payload.preferred_username].find(
    (value): value is string => typeof value === 'string' && value.length > 0
  )
  if (!sub) return null

  let jwks = await loadKeys(now, false)
  let key = jwks.keys.get(header.kid)
  if (!key) {
    jwks = await loadKeys(now, true)
    key = jwks.keys.get(header.kid)
  }
  if (!key) return null

  const valid = verify(
    'RSA-SHA256',
    Buffer.from(`${headerPart}.${payloadPart}`),
    key,
    Buffer.from(signaturePart, 'base64url')
  )
  return valid ? { sub, exp } : null
}
