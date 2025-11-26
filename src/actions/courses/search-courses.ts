'use server'

import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import {
  getCategoryIdBySlug,
  transformCategoriesToFilters,
} from '@/lib/course-category-helpers'
import { filterVisibleCourses } from '@/lib/course-utils'
import { getDalCategorias } from '@/lib/dal'
import { getDalCourses } from '@/lib/dal'

// Type for the expected API response structure
interface CoursesApiResponse {
  data: {
    courses: ModelsCurso[]
    pagination: {
      limit: number
      page: number
      total: number
      total_pages: number
    }
  }
  success: boolean
}

export interface SearchCoursesFilters {
  q?: string
  categoria?: string
  modalidade?: string
  certificado?: string
  periodo?: string
  page?: number
  limit?: number
}

export interface SearchCoursesResult {
  courses: ModelsCurso[]
  pagination?: {
    limit: number
    page: number
    total: number
    total_pages: number
  }
}

/**
 * Search courses with filters using the real API
 */
export async function searchCourses(
  filters: SearchCoursesFilters
): Promise<SearchCoursesResult> {
  try {
    // Get categories to map slug to ID
    let categoryFilters: CategoryFilter[] = []
    let categoriaId: number | undefined

    if (filters.categoria) {
      try {
        const categoriesResponse = await getDalCategorias({
          page: 1,
          pageSize: 50,
        })
        if (
          categoriesResponse.status === 200 &&
          categoriesResponse.data?.data
        ) {
          categoryFilters = transformCategoriesToFilters(
            categoriesResponse.data.data
          )
          categoriaId = getCategoryIdBySlug(categoryFilters, filters.categoria)
        }
      } catch (error) {
        console.error('Error fetching categories for search:', error)
      }
    }

    // Build API params
    const apiParams: Parameters<typeof getDalCourses>[0] = {
      page: filters.page || 1,
      limit: filters.limit || 100,
      search: filters.q,
      categoria_id: categoriaId,
      modalidade: filters.modalidade,
      // Note: certificado and periodo might need to be mapped to API fields
      // Adjust based on actual API capabilities
    }

    // Remove undefined values
    Object.keys(apiParams).forEach(key => {
      const typedKey = key as keyof typeof apiParams
      if (apiParams[typedKey] === undefined) {
        delete apiParams[typedKey]
      }
    })

    const response = await getDalCourses(apiParams)

    if (response.status !== 200) {
      return { courses: [] }
    }

    // Cast through unknown first since GetApiV1Courses200 is { [key: string]: unknown }
    const data = response.data as unknown as CoursesApiResponse

    // Extract courses array from the API response
    const allCourses: ModelsCurso[] = data?.data?.courses || []

    // Filter courses to only show those that should be visible
    const visibleCourses = filterVisibleCourses(allCourses)

    return {
      courses: visibleCourses,
      pagination: data?.data?.pagination,
    }
  } catch (error) {
    console.error('Error searching courses:', error)
    return { courses: [] }
  }
}
