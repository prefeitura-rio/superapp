import CoursesSearchClient from '@/app/components/courses/courses-search-client'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { filterVisibleCourses } from '@/lib/course-utils'
import { getDalCategorias, getDalCourses } from '@/lib/dal'

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string
    query?: string
    modalidade?: string
    local_curso?: string
    categoria?: string
    acessibilidade?: string
  }>
}

async function getCategoryFilters(): Promise<CategoryFilter[]> {
  try {
    const response = await getDalCategorias({
      page: 1,
      pageSize: 50,
      onlyWithCourses: true,
      daysTolerance: 30,
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

async function getInitialCourses(): Promise<ModelsCurso[]> {
  try {
    const response = await getDalCourses({
      limit: 4,
    })

    if (response.status !== 200) {
      return []
    }

    // Cast through unknown first since GetApiV1Courses200 is { [key: string]: unknown }
    const data = response.data as unknown as {
      data?: {
        courses?: ModelsCurso[]
        pagination?: unknown
      }
    }

    // Extract courses array from the API response
    const allCourses: ModelsCurso[] = data?.data?.courses || []

    // Filter courses to only show those that should be visible
    return filterVisibleCourses(allCourses)
  } catch (error) {
    console.error('Error fetching initial courses:', error)
    return []
  }
}

export default async function CoursesSearchPage({
  searchParams,
}: CoursesPageProps) {
  const params = await searchParams
  const q = params.q || params.query || ''
  const hasQuery = q.length >= 3
  const hasFilters = Boolean(
    params.modalidade ||
      params.local_curso ||
      params.categoria ||
      params.acessibilidade
  )

  // Only fetch initial courses if there's no search query or filters
  const shouldFetchInitialCourses = !hasQuery && !hasFilters

  // Fetch categories and initial courses in parallel
  const [categoryFilters, initialCourses] = await Promise.all([
    getCategoryFilters(),
    shouldFetchInitialCourses ? getInitialCourses() : Promise.resolve([]),
  ])

  return (
    <CoursesSearchClient
      initialCategoryFilters={categoryFilters}
      initialCourses={initialCourses}
    />
  )
}
