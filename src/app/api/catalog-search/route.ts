import { getApiPublicSearch } from '@/http-app-catalogo/busca/busca'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || undefined
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const per_page = 50
  const typesParam = searchParams.getAll('types')
  const types = typesParam.length > 0 ? typesParam : undefined

  try {
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
