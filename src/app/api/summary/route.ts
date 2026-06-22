import { getApiPublicSearch } from '@/http-app-catalogo/busca/busca'
import { NextResponse } from 'next/server'

// facilita (Gemini agent) lives on the busca-search base; the candidate services
// come from the catalog search — the SAME results shown on the results page.
const SUMMARIZE_BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH ?? ''
).replace(/\/$/, '')

const EMPTY = { query: '', segments: [], generated: false }

function slugFromUrl(url?: string): string {
  if (!url) return ''
  const match = url.match(/\/servicos\/([^/?#]+)/)
  return match ? match[1] : ''
}

// AI search summary grounded in the SAME catalog results the citizen sees: fetch the
// top services from the catalog search, then let facilita's Gemini agent summarize
// over exactly those (so it considers what actually shows up on the page).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (!SUMMARIZE_BASE || q.length < 2) {
    return NextResponse.json(EMPTY)
  }

  try {
    const search = await getApiPublicSearch(
      { q, page: 1, per_page: 10 },
      { next: { revalidate: 300, tags: ['ai-summary'] } }
    )
    const items =
      search.status === 200
        ? ((search.data?.items ?? []) as Array<{
            title?: string
            short_desc?: string
            url?: string
            id?: string
            metadata?: { slug?: string }
          }>)
        : []

    // top 10 — the agent always receives and considers the first results.
    // The citation slug MUST be `metadata.slug` (what the busca card navigates to,
    // /servicos/categoria/{cat}/{slug}) — NOT the item `url`, which for many services
    // is an external link (e.g. www2.rio.rj.gov.br) and would yield a slug that 404s
    // on the detail page. The category segment is ignored by the detail route, so a
    // literal `servicos` is fine.
    const services = items.slice(0, 10).map(item => {
      const slug = item.metadata?.slug || slugFromUrl(item.url) || item.id || ''
      return {
        slug,
        title: item.title ?? '',
        resumo: item.short_desc ?? '',
        url: slug ? `/servicos/categoria/servicos/${slug}` : '',
      }
    })

    const res = await fetch(`${SUMMARIZE_BASE}/api/v1/summarize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: q, services }),
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json(EMPTY)
    return NextResponse.json(await res.json())
  } catch (error) {
    console.error('Error fetching AI summary:', error)
    return NextResponse.json(EMPTY)
  }
}
