import { NextResponse } from 'next/server'

const BASE = (
  process.env.FACILITA_FLOW_API_URL ??
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ??
  ''
).replace(/\/$/, '')

// Open a guided-flow session; proxies facilita's POST /api/v1/flow/{slug}/start.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!BASE || !slug) {
    return NextResponse.json(
      { error: 'flow backend unavailable' },
      { status: 503 }
    )
  }
  try {
    const res = await fetch(
      `${BASE}/api/v1/flow/${encodeURIComponent(slug)}/start`,
      { method: 'POST', cache: 'no-store' }
    )
    const body = await res.json().catch(() => ({}))
    return NextResponse.json(body, { status: res.status })
  } catch {
    return NextResponse.json(
      { error: 'flow backend unreachable' },
      { status: 502 }
    )
  }
}
