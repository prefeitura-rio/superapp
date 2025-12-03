//@ts-nocheck
//não use isso a menos que saiba oque estiver fazendo!
import { getUserEnrollment } from '@/actions/courses/get-user-enrollment'
import { CourseDetails } from '@/app/components/courses/course-details'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import {
  type UserEnrollmentExtended,
  shouldShowCourse,
} from '@/lib/course-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: courseSlug } = await params
  const userInfo = await getUserInfoFromToken()

  try {
    const response = await getApiV1CoursesCourseId(Number.parseInt(courseSlug))

    if (response.status !== 200 || !response.data?.data) {
      notFound()
    }

    const course = response.data.data

    // Show course even when it is over 30 days since the last class ended
    if (!shouldShowCourse({ course, renderByUrl: true })) {
      notFound()
    }

    // Get user enrollment status for this course
    let userEnrollment: UserEnrollmentExtended | null = null
    try {
      userEnrollment = await getUserEnrollment(course.id)
    } catch (enrollmentError) {
      console.error(
        'Error fetching user enrollment, continuing without it:',
        enrollmentError
      )
      // Continue without enrollment data - user will see "Inscreva-se" button
    }

    // Fetch department/organization data if orgao_id exists
    let departmentData = null
    if (course.orgao_id) {
      try {
        const departmentResponse = await getDepartmentsCdUa(course.orgao_id)
        if (departmentResponse.status === 200 && departmentResponse.data) {
          departmentData = departmentResponse.data
        }
      } catch (departmentError) {
        console.error(
          'Error fetching department data, continuing without it:',
          departmentError
        )
      }
    }

    return (
      <CourseDetails
        course={course}
        userEnrollment={userEnrollment}
        userInfo={userInfo}
        department={departmentData}
      />
    )
  } catch (error) {
    console.error('Error fetching course:', error)
    notFound()
  }
}
