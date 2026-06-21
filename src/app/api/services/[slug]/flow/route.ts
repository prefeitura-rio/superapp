import { NextResponse } from 'next/server'

// Guided-flow backend. Defaults to the busca-search base (facilita), but can be
// pointed at a locally-running facilita via FACILITA_FLOW_API_URL while search
// stays on the production endpoint.
const BASE = (
  process.env.FACILITA_FLOW_API_URL ??
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ??
  ''
).replace(/\/$/, '')

// Flow step outline for a service ("atendimento guiado"); 404 when the service
// has no guided flow. Proxies facilita's GET /api/v1/services/{slug}/flow.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!BASE || !slug) {
    return NextResponse.json({ available: false }, { status: 404 })
  }
  try {
    const res = await fetch(
      `${BASE}/api/v1/services/${encodeURIComponent(slug)}/flow`,
      { cache: 'no-store' }
    )
    if (!res.ok) return NextResponse.json({ available: false }, { status: 404 })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ available: false }, { status: 404 })
  }
}
