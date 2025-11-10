import {
  NEXT_PUBLIC_BUSCA_1746_COLLECTION,
  NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION,
  NEXT_PUBLIC_BUSCA_PREFRIO_COLLECTION,
} from '@/constants/venvs'
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

    const rootUrl = process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH
    span.setAttribute('external.api.url', rootUrl || '')

    try {
      addSpanEvent('search.api.request.start')

      // Use fetch with explicit caching
      const response = await fetch(
        `${rootUrl}api/v1/busca-hibrida-multi?q=${q}&collections=${NEXT_PUBLIC_BUSCA_1746_COLLECTION},${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION},${NEXT_PUBLIC_BUSCA_PREFRIO_COLLECTION}&page=1&per_page=20`,
        {
          // Cache the response for 1 hour
          next: {
            revalidate: 3600,
            tags: ['search-api'],
          },
        }
      )

      span.setAttribute('http.status_code', response.status)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      // Transform the new format to the old format expected by the frontend
      const transformedData = {
        result: data.hits ? data.hits.map((hit: any) => hit.document) : [],
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
