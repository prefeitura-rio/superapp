import CoursePageClient from '@/app/components/courses/courses-client'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import {
  filterVisibleCourses,
  parseCoursesListResponse,
  sortCourses,
} from '@/lib/course-utils'
import { getDalCategorias, getDalCourses } from '@/lib/dal'

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
    const response = await getDalCourses({
      page: 1,
      limit: 100,
    })
    const allCourses = parseCoursesListResponse(
      response.status === 200 ? response.data : null
    )
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
