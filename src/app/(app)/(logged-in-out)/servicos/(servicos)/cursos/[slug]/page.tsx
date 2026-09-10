//@ts-nocheck
//não use isso a menos que saiba oque estiver fazendo!
import { CourseDetails } from '@/app/components/courses/course-details'
import { getApiPublicCoursesCourseId } from '@/http-courses/courses/courses'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { parseCourseDetailResponse, shouldShowCourse } from '@/lib/course-utils'
import { notFound } from 'next/navigation'
import { CourseUnavailablePage } from './course-unavailable-page'

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { slug: courseSlug } = await params
  const { from } = await searchParams

  try {
    const response = await getApiPublicCoursesCourseId(
      Number.parseInt(courseSlug)
    )
    const course = parseCourseDetailResponse(response.data)

    if (response.status !== 200 || !course) {
      if (from === 'my-courses') return <CourseUnavailablePage />
      notFound()
    }

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
