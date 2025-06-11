'use client'

import googleIcon from '@/assets/google.svg'
import { JobDrawer } from '@/components/ui/custom/job-drawer'

import { Bookmark } from 'lucide-react'
import Image from 'next/image'
import { providerIcons } from './utils'

interface Job {
  id: number
  title: string
  status: string
  provider: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  spots?: number
  description?: string
  requirements?: string[]
  salary?: number
  publishedAt?: string
}

interface RecentlyAddedJobsProps {
  jobs: Job[]
}

const TYPE_LABELS: Record<string, string> = {
  construction: 'Construção',
  sales: 'Vendas',
  service: 'Atendimento',
  administration: 'Administração',
  financial: 'Financeiro',
  technology: 'Tecnologia',
}

function getJobCardColor(type: string) {
  if (type === 'technology' || type === 'ai' || type === 'education')
    return '#01A9D8'
  if (type === 'construction') return '#44CC77'
  if (type === 'environment') return '#EA5D6E'
  return '#01A9D8'
}

export default function RecentlyAddedJobs({ jobs }: RecentlyAddedJobsProps) {
  const recentJobs = jobs.filter(job => job.recentlyAdded)

  return (
    <>
      <h2 className="text-md font-medium mb-4 px-5 pt-6">Recentes</h2>
      <div className="flex flex-col gap-4 px-5 pb-8">
        {recentJobs.map(job => (
          <JobDrawer
            key={job.id}
            job={job}
            color={getJobCardColor(job.type)}
            icon={providerIcons[job.provider] || googleIcon}
            description={job.description}
            spots={job.spots}
            requirements={job.requirements}
          >
            <div className="bg-zinc-900 rounded-2xl p-1 md:p-2 py-6 flex items-center gap-1 md:gap-2 relative border-2 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={providerIcons[job.provider] || googleIcon}
                  alt={job.provider}
                  width={36}
                  height={56}
                  className={
                    job.provider === 'Prefeitura'
                      ? 'filter brightness-0 invert'
                      : ''
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="text-md mb-2 line-clamp-2 pr-4 leading-5 text-white">
                  {job.title} <br />
                  <span className="text-zinc-400 text-xs">{job.provider}</span>
                </h3>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    {TYPE_LABELS[job.type] || job.type}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    {job.modality}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    R${job.salary}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="absolute right-2 top-2 text-zinc-400 hover:text-white transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Bookmark className="w-5 h-5" />
                <span className="sr-only">Bookmark job</span>
              </button>
            </div>
          </JobDrawer>
        ))}
      </div>
    </>
  )
}
