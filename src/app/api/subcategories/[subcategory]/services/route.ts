import { getDalSubcategoriesSubcategoryServices } from '@/lib/dal'
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

    const response = await getDalSubcategoriesSubcategoryServices(
      decodedSubcategory,
      {
        page,
        per_page: perPage,
        include_inactive: false,
        category: decodedCategory,
      }
    )

    if (response.status !== 200) {
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: response.status }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching services by subcategory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
