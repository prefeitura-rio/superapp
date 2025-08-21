import { CourseDetails } from '@/app/components/courses/course-details'
import { createCourseSlug } from '@/lib/utils'
import { COURSES } from '@/mocks/mock-courses'

interface PageProps {
  params: { slug: string }
}

async function getCourseBySlug(slug: string) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return COURSES.find(c => createCourseSlug(c.id, c.title) === slug) || null
}

export default async function CoursePage({ params }: PageProps) {
  const courseSlug = params.slug
  const course = await getCourseBySlug(courseSlug)

  if (!course) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Curso não encontrado
      </div>
    )
  }

  return <CourseDetails course={course} />
}
