import coursesApi from '@/actions/courses'
import CoursePageClient from '@/app/components/courses/courses-client'

export default async function CoursesPage() {
  const courses = await coursesApi.getAllCourses()

  return <CoursePageClient courses={courses} />
}
