//@ts-nocheck
//não use isso a menos que saiba oque estiver fazendo!
import { CourseDetails } from '@/app/components/courses/course-details'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { shouldShowCourse } from '@/lib/course-utils'
import { notFound } from 'next/navigation'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: courseSlug } = await params

  try {
    const response = await getApiV1CoursesCourseId(Number.parseInt(courseSlug))

    if (response.status !== 200 || !response.data?.data) {
      notFound()
    }

    const course = response.data.data

    if (!shouldShowCourse({ course, renderByUrl: true })) {
      notFound()
    }

    // Fetch department/organization data if orgao_id exists (public data)
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

    // User enrollment is fetched client-side via TanStack Query
    // to avoid CDN caching authenticated data
    return <CourseDetails course={course} department={departmentData} />
  } catch (error) {
    console.error('Error fetching course:', error)
    notFound()
  }
}
