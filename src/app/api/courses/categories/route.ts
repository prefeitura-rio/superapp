import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { getDalCategorias } from '@/lib/dal'
import { NextResponse } from 'next/server'

/**
 * Route handler to fetch course categories
 */
export async function GET() {
  try {
    const response = await getDalCategorias({
      page: 1,
      pageSize: 50,
      onlyWithCourses: true,
      daysTolerance: 30,
    })
    if (response.status === 200 && response.data?.data) {
      const categories: CategoryFilter[] = transformCategoriesToFilters(
        response.data.data
      )
      return NextResponse.json(categories)
    }
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching course categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}
