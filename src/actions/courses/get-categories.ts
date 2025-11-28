'use server'

import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { getDalCategorias } from '@/lib/dal'

/**
 * Server action to fetch course categories
 * Can be called from client components
 */
export async function getCourseCategories(): Promise<CategoryFilter[]> {
  try {
    const response = await getDalCategorias({
      page: 1,
      pageSize: 50,
    })
    if (response.status === 200 && response.data?.data) {
      return transformCategoriesToFilters(response.data.data)
    }
    return []
  } catch (error) {
    console.error('Error fetching course categories:', error)
    return []
  }
}

