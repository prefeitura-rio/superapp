import CoursePageClient from '@/app/components/courses/courses-client'
import { COURSES } from '@/mocks/mock-courses'

async function getCourses() {
  return COURSES
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return <CoursePageClient courses={courses} />
}
