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

export type RatingRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

/** Devolve `null` se liberou ou, se bloqueou, em quantos ms o voto mais antigo sai da janela. */
function hit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
  now: number
): number | null {
  const recent = (hits.get(key) ?? []).filter(at => now - at < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return recent[0] + windowMs - now
  }

  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    const oldestKey = hits.keys().next().value
    if (oldestKey !== undefined) hits.delete(oldestKey)
  }

  recent.push(now)
  hits.set(key, recent)
  return null
}

export function allowRatingRequest(
  { voterToken, ip }: { voterToken: string; ip: string },
  now = Date.now()
): RatingRateLimitResult {
  const waitMs =
    hit(`voter:${voterToken}`, RATING_LIMITS.perVoter, now) ??
    hit(`ip:${ip}`, RATING_LIMITS.perIp, now)

  if (waitMs === null) return { allowed: true }
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
  }
}

/** Só para testes. */
export function resetRatingRateLimit() {
  hits.clear()
}
