'use client'

import JobsHeader from '../../../components/jobs-header'
import RecentlyAddedJobs from '../../../components/recently-added-jobs'
import RecommendedJobsCards from '../../../components/recommended-jobs-cards'
import { Badge } from '@/components/ui/badge'
import { JOBS } from '@/mocks/mock-jobs'

import { useState } from 'react'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Construção', value: 'construction' },
  { label: 'Vendas', value: 'sales' },
  { label: 'Atendimento', value: 'service' },
  { label: 'Administração', value: 'administration' },
  { label: 'Financeiro', value: 'financial' },
  { label: 'Tecnologia', value: 'technology' },
]

export default function JobsPage() {
  const [selected, setSelected] = useState('all')

  const filteredJobs =
    selected === 'all' ? JOBS : JOBS.filter(job => job.type === selected)

  return (
    <div className="min-h-lvh">
      <JobsHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="relative">
          <h2 className="px-5 text-4xl font-medium mb-2 bg-background z-10 pt-7 pb-3">
            Seu emprego <br /> Começa aqui
          </h2>
          {/* Scrollable Filters */}
          <div className="relative w-full overflow-x-auto px-5 pb-4 no-scrollbar">
            <div className="flex gap-3 min-w-max">
              {FILTERS.map(filter => (
                <Badge
                  key={filter.value}
                  onClick={() => setSelected(filter.value)}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors
                ${
                  selected === filter.value
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }
              `}
                  variant={selected === filter.value ? 'secondary' : 'outline'}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>
        <RecommendedJobsCards jobs={filteredJobs} />
        <RecentlyAddedJobs jobs={filteredJobs} />
      </main>
    </div>
  )
}
