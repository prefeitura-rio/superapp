import { NextResponse } from 'next/server'

const BASE = (
  process.env.FACILITA_FLOW_API_URL ??
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ??
  ''
).replace(/\/$/, '')

// Advance a guided-flow session with the citizen's answer (a closed token, a
// free-text field, or a correction). Proxies POST /api/v1/flow/{slug}/step.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!BASE || !slug) {
    return NextResponse.json(
      { error: 'flow backend unavailable' },
      { status: 503 }
    )
  }
  const body = await request.json().catch(() => ({}))
  try {
    const res = await fetch(
      `${BASE}/api/v1/flow/${encodeURIComponent(slug)}/step`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )
    const json = await res.json().catch(() => ({}))
    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json(
      { error: 'flow backend unreachable' },
      { status: 502 }
    )
  }
}
