/**
 * Última camada de rate limit da votação, por processo (cada pod tem o seu
 * contador). O freio de verdade fica na borda (nginx/Cloudflare), onde o IP real
 * do cidadão existe; isto só segura o uso repetido que passar por ela.
 */

const HOUR_MS = 60 * 60 * 1000

export const RATING_LIMITS = {
  perVoter: { max: 20, windowMs: HOUR_MS },
  perIp: { max: 60, windowMs: HOUR_MS },
} as const

const MAX_TRACKED_KEYS = 10_000

const hits = new Map<string, number[]>()

function allow(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
  now: number
): boolean {
  const recent = (hits.get(key) ?? []).filter(at => now - at < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }

  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    const oldestKey = hits.keys().next().value
    if (oldestKey !== undefined) hits.delete(oldestKey)
  }

  recent.push(now)
  hits.set(key, recent)
  return true
}

export function allowRatingRequest(
  { voterToken, ip }: { voterToken: string; ip: string },
  now = Date.now()
): boolean {
  return (
    allow(`voter:${voterToken}`, RATING_LIMITS.perVoter, now) &&
    allow(`ip:${ip}`, RATING_LIMITS.perIp, now)
  )
}

/** Só para testes. */
export function resetRatingRateLimit() {
  hits.clear()
}
