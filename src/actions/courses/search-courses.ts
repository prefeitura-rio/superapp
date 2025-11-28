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
  local_curso?: string
  acessibilidade?: string
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

    // Map local_curso to neighborhood_zone
    // Map zone values to API format
    const neighborhoodZoneMap: Record<string, string> = {
      'zona-oeste': 'Zona Oeste',
      'zona-norte': 'Zona Norte',
      'zona-sul': 'Zona Sul',
      centro: 'Centro',
    }
    const neighborhood_zone = filters.local_curso
      ? neighborhoodZoneMap[filters.local_curso] || filters.local_curso
      : undefined

    // Map acessibilidade to acessibilidade_id
    // Note: This is a simplified mapping. In production, you might want to
    // fetch accessibility options from the API to get the correct IDs
    const acessibilidadeMap: Record<string, number> = {
      acessivel: 1, // Assuming ID 1 for "Acessível PCD"
      exclusivo: 2, // Assuming ID 2 for "Exclusivo PCD"
    }
    const acessibilidade_id = filters.acessibilidade
      ? acessibilidadeMap[filters.acessibilidade]
      : undefined

    // Build API params
    const apiParams: Parameters<typeof getDalCourses>[0] = {
      page: filters.page || 1,
      limit: filters.limit || 100,
      search: filters.q,
      categoria_id: categoriaId,
      modalidade: filters.modalidade,
      neighborhood_zone,
      acessibilidade_id,
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
