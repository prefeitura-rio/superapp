import CoursePageClient from '@/app/components/courses/courses-client'
import { getApiV1Courses } from '@/http-courses/courses/courses'
import { ModelsCurso } from '@/http-courses/models'
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
    const response = await getApiV1Courses()
    const data = response.data as CoursesApiResponse
    
    // Extract courses array from the API response
    const courses: ModelsCurso[] = data?.data?.courses || []
    
    return <CoursePageClient courses={courses} userInfo={userInfo} />
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Return empty courses array on error
    return <CoursePageClient courses={[]} userInfo={userInfo} />
  }
}
