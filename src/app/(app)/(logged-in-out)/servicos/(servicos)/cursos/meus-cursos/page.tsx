import { MyCoursesCard } from '@/app/components/courses/my-course-card'
import { MyCoursesBackButton } from './components/back-button'
import { buildAuthUrl } from '@/constants/url'
import { getApiV1EnrollmentsUserCpf } from '@/http-courses/enrollments/enrollments'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function MyCoursesPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/cursos/meus-cursos'))
  }

  try {
    // Fetch user enrollments with pagination
    const response = await getApiV1EnrollmentsUserCpf(userInfo.cpf, {
      page: 1,
      limit: 100, // Get more enrollments to show all user courses
    })

    if (response.status !== 200) {
      console.error(
        'Failed to fetch enrollments:',
        response.status,
        response.data
      )
      throw new Error(`API returned status ${response.status}`)
    }

    const data = response.data as any

    // Extract enrollments array from the API response
    const enrollments = data?.data?.enrollments || []

    // Transform enrollments to match the expected course structure
    const coursesWithEnrollments = enrollments
      .map((enrollment: any) => ({
        ...enrollment.curso,
        id: enrollment.course_id,
        title: enrollment.curso?.title || 'Curso',
        description: enrollment.curso?.description,
        imageUrl:
          enrollment.curso?.cover_image || enrollment.curso?.institutional_logo,
        provider: enrollment.curso?.organization,
        status: enrollment.status,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        updatedAt: enrollment.updated_at,
      }))
      .filter((course: any) => course.id)

    return (
      <div className="max-w-4xl mx-auto py-6">
        <MyCoursesBackButton />
        <div className="relative overflow-hidden mt-20 px-4">
          <MyCoursesCard courses={coursesWithEnrollments} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    // Return empty courses array on error
    return (
      <div className="max-w-4xl mx-auto py-6">
        <MyCoursesBackButton />
        <div className="relative overflow-hidden mt-20 px-4">
          <MyCoursesCard courses={[]} />
        </div>
      </div>
    )
  }
}
