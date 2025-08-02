import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json(
      { error: 'Query parameter q is required' },
      { status: 400 }
    )
  }

  const rootUrl = process.env.NEXT_PUBLIC_BASE_API_URL

  try {
    // Use fetch with explicit caching
    const response = await fetch(
      `${rootUrl}app-busca-search/api/v1/busca-hibrida-multi?q=${q}&collections=carioca-digital,1746,pref-rio&page=1&per_page=20`,
      {
        // Cache the response for 1 hour
        next: {
          revalidate: 3600,
          tags: ['search-api'],
        },
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    // Transform the new format to the old format expected by the frontend
    const transformedData = {
      result: data.hits ? data.hits.map((hit: any) => hit.document) : [],
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
