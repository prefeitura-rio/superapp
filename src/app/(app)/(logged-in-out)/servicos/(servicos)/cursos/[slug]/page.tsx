//@ts-nocheck
//não use isso a menos que saiba oque estiver fazendo!
import { CourseDetails } from '@/app/components/courses/course-details'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import { notFound } from 'next/navigation'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: courseSlug } = await params
  

  try {
    const response = await getApiV1CoursesCourseId(parseInt(courseSlug))

    if (response.status !== 200 || !response.data?.data) {
      notFound()
    }

    const course = response.data.data

    return <CourseDetails course={course} />
  } catch (error) {
    console.error('Error fetching course:', error)
    notFound()
  }
}
