import JobCardSearchPage from '@/app/(private)/components/job-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { applicationJobs } from '@/mocks/application-jobs'

export default function SubscribedJobsPage() {
  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Meus Empregos" />
      <div className="px-4">
        <h2 className="text-md pt-4 font-semibold">Resultado</h2>
        <div className="pt-4">
          {applicationJobs.length === 0 && (
            <div className="text-zinc-400 text-center py-10">
              Você ainda não aplicou para nenhuma vaga de emprego
            </div>
          )}
          {applicationJobs.map(job => (
            <JobCardSearchPage key={job.id} job={job} subscribed />
          ))}
        </div>
      </div>
    </main>
  )
}
