const WINDOW_MS = 60_000
const MAX_REQUESTS = 30

const hits = new Map<string, number[]>()

export function previewClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Per-process limit. A second pod does not see this counter. */
export function allowPreviewRequest(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter(at => now - at < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent)
    return false
  }

  recent.push(now)
  hits.set(ip, recent)
  return true
}
