import CourseCardSearchPage from '@/app/(private)/components/course-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { subscribedCourses } from '@/mocks/subscribed-courses'

export default function SubscribedCoursesPage() {
  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Meus Cursos" />
      <div className="px-5">
        <h2 className="text-md pt-4 font-semibold">Resultado</h2>
        <div className="pt-4">
          {subscribedCourses.length === 0 && (
            <div className="text-zinc-400 text-center py-10">
              Você ainda não se inscreveu em nenhum curso
            </div>
          )}
          {subscribedCourses.map(course => (
            <CourseCardSearchPage key={course.id} course={course} subscribed />
          ))}
        </div>
      </div>
    </main>
  )
}
