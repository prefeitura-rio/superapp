import { ModelsSearchType } from '@/http-busca-search/models/modelsSearchType'
import { getApiV2Search } from '@/http-busca-search/search-v2/search-v2'
import { addSpanEvent, withSpan } from '@/lib/telemetry'
import type { CourseData, JobData, ServiceData } from '@/types/search-v2'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return withSpan('api.search', async span => {
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

      // Use v2 endpoint with keyword search
      const response = await getApiV2Search(
        {
          q,
          page: 1,
          per_page: 20,
          type: ModelsSearchType.SearchTypeKeyword,
          include_inactive: false,
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

      // Transform the v2 format to the format expected by the frontend
      const transformedData = {
        result:
          response.data.results?.map(result => {
            if (result.type === 'service') {
              const serviceData = result.data as unknown as ServiceData
              return {
                id: result.id,
                slug: serviceData.slug,
                titulo: serviceData.nome_servico,
                descricao: serviceData.resumo_plaintext || serviceData.resumo,
                category: serviceData.tema_geral,
                tipo: 'servico' as const,
                collection: result.collection,
              }
            }

            if (result.type === 'course') {
              const courseData = result.data as unknown as CourseData
              return {
                id: result.id,
                slug: result.id, // courses use ID as slug
                titulo: courseData.titulo,
                descricao: courseData.descricao,
                category: courseData.theme || 'Curso',
                tipo: 'curso' as const,
                collection: result.collection,
              }
            }

            if (result.type === 'job') {
              const jobData = result.data as unknown as JobData
              return {
                id: result.id,
                slug: result.id, // jobs use ID as slug
                titulo: jobData.titulo,
                descricao: jobData.descricao,
                category: 'Emprego',
                tipo: 'job' as const,
                collection: result.collection,
              }
            }

            // Handle other types if needed
            return {
              id: result.id,
              titulo: 'Unknown',
              tipo: result.type as string,
              collection: result.collection,
            }
          }) || [],
      }

      addSpanEvent('search.results.transformed', {
        'results.count': transformedData.result.length,
        'results.collections': response.data.collections?.join(',') || '',
      })

      return NextResponse.json(transformedData)
    } catch (error) {
      console.error('Error fetching data:', error)
      span.recordException(error as Error)
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }
  })
}
