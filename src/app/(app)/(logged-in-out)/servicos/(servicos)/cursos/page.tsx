import CoursePageClient from '@/app/components/courses/courses-client'
import { FloatNavigation } from '@/app/components/float-navigation'
import { getApiV1Courses } from '@/http-courses/courses/courses'
import { getApiV1EnrollmentsUserCpf } from '@/http-courses/enrollments/enrollments'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { filterVisibleCourses, sortCourses } from '@/lib/course-utils'
import { getDalCategorias } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

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
  const userInfo = await getUserInfoFromToken()

  try {
    // Fetch categories with caching
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
      // Continue with empty categories array
    }

    // Fetch all courses
    const response = await getApiV1Courses({
      page: 1,
      limit: 100,
    })
    const data = response.data as CoursesApiResponse

    // Extract courses array from the API response
    const allCourses: ModelsCurso[] = data?.data?.courses || []

    // Filter courses to only show those that should be visible
    const visibleCourses = filterVisibleCourses(allCourses)

    // Sort courses: open enrollments first, then by created_at (most recent first)
    const sortedCourses = sortCourses(visibleCourses)

    // Fetch user enrollments if authenticated
    let myCourses: any[] = []
    if (userInfo?.cpf) {
      try {
        const enrollmentsResponse = await getApiV1EnrollmentsUserCpf(
          userInfo.cpf,
          {
            page: 1,
            limit: 100,
          }
        )

        if (enrollmentsResponse.status === 200) {
          const enrollmentsData = enrollmentsResponse.data as any
          const enrollments = enrollmentsData?.data?.enrollments || []

          myCourses = enrollments
            .map((enrollment: any) => ({
              ...enrollment.curso,
              id: enrollment.course_id,
              title: enrollment.curso?.title || 'Curso',
              description: enrollment.curso?.description,
              imageUrl:
                enrollment.curso?.cover_image ||
                enrollment.curso?.institutional_logo,
              provider: enrollment.curso?.organization,
              status: enrollment.status,
              enrollmentId: enrollment.id,
              accessibility: enrollment.curso?.accessibility,
              enrolledAt: enrollment.enrolled_at,
              updatedAt: enrollment.updated_at,
            }))
            .filter((course: any) => course.id)
        }
      } catch (enrollmentError) {
        console.error('Error fetching user enrollments:', enrollmentError)
        // Keep myCourses as empty array
      }
    }

    return (
      <>
        <CoursePageClient
          courses={sortedCourses}
          myCourses={myCourses}
          userInfo={userInfo}
          categoryFilters={categoriesFilters}
        />
        <FloatNavigation />
      </>
    )
  } catch (error) {
    console.error('Error fetching courses:', error)
    return (
      <CoursePageClient
        courses={[]}
        myCourses={[]}
        userInfo={userInfo}
        categoryFilters={[]}
      />
    )
  }
}
