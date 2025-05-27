import JobCardSearchPage from '@/app/(private)/components/job-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { favoritesJobs } from '@/mocks/favorites-jobs'

export default function FavoritesPage() {
  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Favorites" />
      <div className="px-5">
        <h2 className="text-md pt-4 font-semibold">Resultado</h2>
        <div className="pt-4">
          {favoritesJobs.length === 0 && (
            <div className="text-zinc-400 text-center py-10">
              Você ainda não favoritou nenhum curso
            </div>
          )}
          {favoritesJobs.map(job => (
            <JobCardSearchPage key={job.id} job={job} favorite />
          ))}
        </div>
      </div>
    </main>
  )
}
