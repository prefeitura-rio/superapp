import { NextResponse } from 'next/server'

const BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ?? ''
).replace(/\/$/, '')

const EMPTY = {
  recommendations: [],
  journey: { theme: null, next_steps: [] },
  cluster: { services: [] },
}

// Combined related-services / citizen-journey / thematic-cluster for a service,
// proxying facilita's /api/v1/services/{slug}/{recommendations,journey,cluster}.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!BASE || !slug) return NextResponse.json(EMPTY)

  const fetchJson = async (path: string) => {
    try {
      const res = await fetch(`${BASE}${path}`, {
        next: { revalidate: 600, tags: ['service-relations'] },
      })
      return res.ok ? await res.json() : null
    } catch {
      return null
    }
  }

  const encoded = encodeURIComponent(slug)
  const [recs, journey, cluster] = await Promise.all([
    fetchJson(`/api/v1/services/${encoded}/recommendations`),
    fetchJson(`/api/v1/services/${encoded}/journey`),
    fetchJson(`/api/v1/services/${encoded}/cluster`),
  ])

  return NextResponse.json({
    recommendations: recs?.recommendations ?? [],
    journey: journey ?? EMPTY.journey,
    cluster: cluster ?? EMPTY.cluster,
  })
}
