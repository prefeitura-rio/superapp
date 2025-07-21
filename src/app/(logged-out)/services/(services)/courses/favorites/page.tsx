import CourseCardSearchPage from '@/app/(private)/components/course-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { favoritesCourses } from '@/mocks/favorite-courses'

export default function FavoritesPage() {
  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Favorites" />
      <div className="px-4">
        <h2 className="text-md pt-4 font-semibold">Resultado</h2>
        <div className="pt-4">
          {favoritesCourses.length === 0 && (
            <div className="text-zinc-400 text-center py-10">
              Você ainda não favoritou nenhum curso
            </div>
          )}
          {favoritesCourses.map(course => (
            <CourseCardSearchPage key={course.id} course={course} favorite />
          ))}
        </div>
      </div>
    </main>
  )
}
