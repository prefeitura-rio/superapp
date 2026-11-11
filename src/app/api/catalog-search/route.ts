import { getApiPublicSearch } from '@/http-app-catalogo/busca/busca'
import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import { getApiV1Search } from '@/http-busca-search/search/search'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || undefined
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const per_page = 50
  const typesParam = searchParams.getAll('types')
  const types = typesParam.length > 0 ? typesParam : undefined

  try {
    if (!isSalesforceServicesEnabled()) {
      if (!q || types?.some(type => type !== 'service')) {
        return NextResponse.json({ items: [] })
      }

      const response = await getApiV1Search(
        {
          q,
          type: 'hybrid',
          page,
          per_page,
          include_inactive: false,
        },
        {
          next: {
            revalidate: 300,
            tags: ['legacy-search'],
          },
        }
      )

      if (response.status !== 200) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }

      const items: ModelsSearchItem[] = (response.data.results ?? [])
        .filter(result => result.slug || result.id)
        .map(result => ({
          id: result.id,
          title: result.title,
          short_desc: result.description,
          type: 'service',
          url: result.slug
            ? `/servicos/categoria/${encodeURIComponent(result.category ?? '')}/${encodeURIComponent(result.slug)}`
            : undefined,
          metadata: {
            slug: result.slug,
            tema_geral: result.category,
          },
        }))

      return NextResponse.json({ items })
    }

    const response = await getApiPublicSearch(
      { q, page, per_page, types },
      {
        next: {
          revalidate: q ? 300 : 600, // 5min com query, 10min para sugestões (sem query)
          tags: ['catalog-search'],
        },
      }
    )

    if (response.status === 200) {
      return NextResponse.json(response.data)
    }

    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  } catch (error) {
    console.error('Error fetching catalog search results:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
