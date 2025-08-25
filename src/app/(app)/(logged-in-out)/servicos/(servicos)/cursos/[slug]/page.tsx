import courseApi from '@/actions/courses'
import { extractCourseId } from '@/actions/courses/utils-mock'
import { CourseDetails } from '@/app/components/courses/course-details'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CoursePage({ params }: PageProps) {
  const { slug: courseSlug } = await params
  const courseUuid = extractCourseId(courseSlug)
  const course = await courseApi.getCourseById(courseUuid)

  if (!course) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Curso não encontrado
      </div>
    )
  }

  return <CourseDetails course={course} />
}
