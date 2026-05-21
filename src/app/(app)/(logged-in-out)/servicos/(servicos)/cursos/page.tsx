import CoursePageClient from '@/app/components/courses/courses-client'
import { getApiV1Courses } from '@/http-courses/courses/courses'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { filterVisibleCourses, sortCourses } from '@/lib/course-utils'
import { getDalCategorias } from '@/lib/dal'

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

export default async function CoursesPage() {
  try {
    // Fetch categories with caching (public data, same for all users)
    let categoriesFilters: CategoryFilter[] = []
    try {
      const categoriesResponse = await getDalCategorias({
        page: 1,
        pageSize: 50,
        onlyWithCourses: true,
        daysTolerance: 30,
      })
      if (categoriesResponse.status === 200 && categoriesResponse.data?.data) {
        categoriesFilters = transformCategoriesToFilters(
          categoriesResponse.data.data
        )
      }
    } catch (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    // Fetch all courses (public data, cached via DAL)
    const response = await getApiV1Courses({
      page: 1,
      limit: 100,
    })
    const data = response.data as CoursesApiResponse

    const allCourses: ModelsCurso[] = data?.data?.courses || []
    const visibleCourses = filterVisibleCourses(allCourses)
    const sortedCourses = sortCourses(visibleCourses)

    // User enrollments are fetched client-side via TanStack Query
    // to avoid CDN caching authenticated data
    return (
      <CoursePageClient
        courses={sortedCourses}
        categoryFilters={categoriesFilters}
      />
    )
  } catch (error) {
    console.error('Error fetching courses:', error)
    return <CoursePageClient courses={[]} categoryFilters={[]} />
  }
}
