import { fetchServicesBySubcategory } from '@/lib/services-utils'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subcategory: string }> }
) {
  const { subcategory } = await params
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get('page') || '1', 10)
  const perPage = Number.parseInt(searchParams.get('per_page') || '50', 10)
  const category = searchParams.get('category') || undefined

  try {
    const decodedSubcategory = decodeURIComponent(subcategory)
    const decodedCategory = category ? decodeURIComponent(category) : undefined

    const data = await fetchServicesBySubcategory(
      decodedSubcategory,
      page,
      perPage,
      decodedCategory
    )

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 502 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching services by subcategory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
