import type { Job } from '@/types/job'
import JobCard from './job-card'
import { getJobCardColor, providerIcons } from './utils'

interface RecommendedJobsCardsProps {
  jobs: Job[]
}

export default function RecommendedJobsCards({
  jobs,
}: RecommendedJobsCardsProps) {
  const recommended = jobs.filter(job => job.recommended)
  return (
    <>
      <h2 className="text-md font-medium mb-4 px-4 pt-4">Recomendados</h2>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {recommended.map(job => (
            <JobCard
              key={job.id}
              id={job.id}
              provider={job.provider}
              title={job.title}
              modality={job.modality}
              color={getJobCardColor(job.type)}
              icon={providerIcons[job.provider]}
              status={job.status}
              type={job.type}
              recommended={job.recommended}
              recentlyAdded={job.recentlyAdded}
              description={job.description}
              requirements={job.requirements}
              salary={job.salary}
              publishedAt={job.publishedAt}
            />
          ))}
        </div>
      </div>
    </>
  )
}
