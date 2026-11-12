import CoursePageClient from '@/app/components/courses/courses-client'
import { GetApiPublicCoursesSort } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import {
  COURSE_LISTING_STATUS_CSV,
  parseCoursesListPagination,
  parseCoursesListResponse,
} from '@/lib/course-utils'
import { COURSES_PAGE_SIZE } from '@/lib/courses-list-query'
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

    // Same params as /api/courses/search so SSR and client share one Data Cache entry
    const response = await getDalCourses({
      page: 1,
      limit: COURSES_PAGE_SIZE,
      status: COURSE_LISTING_STATUS_CSV,
      sort: GetApiPublicCoursesSort.availability,
    })
    const courses = parseCoursesListResponse(
      response.status === 200 ? response.data : null
    )
    const pagination = parseCoursesListPagination(
      response.status === 200 ? response.data : null
    )

    // User enrollments are fetched client-side via TanStack Query
    // to avoid CDN caching authenticated data
    return (
      <CoursePageClient
        initialCoursesPage={{ courses, pagination }}
        categoryFilters={categoriesFilters}
      />
    )
  } catch (error) {
    console.error('Error fetching courses:', error)
    return (
      <CoursePageClient
        initialCoursesPage={{ courses: [] }}
        categoryFilters={[]}
      />
    )
  }
}
