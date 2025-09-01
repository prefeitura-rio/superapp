//@ts-nocheck
//não use isso a menos que saiba oque estiver fazendo!
import { getUserEnrollment } from '@/actions/courses/get-user-enrollment'
import { CourseDetails } from '@/app/components/courses/course-details'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import { shouldShowCourse } from '@/lib/course-utils'
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

    // Check if course should be visible using the new logic
    if (!shouldShowCourse(course)) {
      notFound()
    }

    // Get user enrollment status for this course
    let userEnrollment = null
    try {
      userEnrollment = await getUserEnrollment(course.id)
    } catch (enrollmentError) {
      console.error(
        'Error fetching user enrollment, continuing without it:',
        enrollmentError
      )
      // Continue without enrollment data - user will see "Inscreva-se" button
    }

    return (
      <CourseDetails
        course={course}
        userEnrollment={userEnrollment}
        userInfo={userInfo}
      />
    )
  } catch (error) {
    console.error('Error fetching course:', error)
    notFound()
  }
}
