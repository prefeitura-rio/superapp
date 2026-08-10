import { fetchSubcategoriesByCategory } from '@/lib/services-utils'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params

  try {
    const decodedCategory = decodeURIComponent(category)
    const result = await fetchSubcategoriesByCategory(decodedCategory)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error fetching subcategories by category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
