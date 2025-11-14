import { getApiV1Search } from '@/http-busca-search/search/search'
import { ModelsSearchType } from '@/http-busca-search/models/modelsSearchType'
import { NextResponse } from 'next/server'
import { withSpan, addSpanEvent } from '@/lib/telemetry'

export async function GET(request: Request) {
  return withSpan('api.search', async (span) => {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    span.setAttribute('search.query', q || '')

    if (!q) {
      span.addEvent('search.validation.failed', { reason: 'missing_query' })
      return NextResponse.json(
        { error: 'Query parameter q is required' },
        { status: 400 }
      )
    }

    try {
      addSpanEvent('search.api.request.start')

      // Use semantic search with threshold for best results
      const response = await getApiV1Search(
        {
          q,
          type: ModelsSearchType.SearchTypeSemantic,
          page: 1,
          per_page: 20,
          include_inactive: true,
          threshold_semantic: 0.4,
        },
        {
          // Cache the response for 10 minutes
          next: {
            revalidate: 600,
            tags: ['search-api'],
          },
        }
      )

      span.setAttribute('http.status_code', response.status)

      if (response.status !== 200) {
        throw new Error(`Search API returned status ${response.status}`)
      }

      // Transform the new format to the old format expected by the frontend
      const transformedData = {
        result:
          response.data.results?.map((service) => ({
            id: service.id,
            titulo: service.title,
            descricao: service.description,
            category: service.category,
            tipo: 'servico',
          })) || [],
      }

      addSpanEvent('search.results.transformed', {
        'results.count': transformedData.result.length,
      })

      return NextResponse.json(transformedData)
    } catch (error) {
      console.error('Error fetching data:', error)
      span.recordException(error as Error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
  })
}
