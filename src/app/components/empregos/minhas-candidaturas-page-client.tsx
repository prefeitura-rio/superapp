'use client'

import { MinhasCandidaturasContent } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/minhas-candidaturas/minhas-candidaturas-content'
import type { CandidaturaCardData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/minhas-candidaturas/minhas-candidaturas-utils'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'

async function fetchCandidaturas(): Promise<{
  candidaturas: CandidaturaCardData[]
  hasCandidaturas: boolean
}> {
  const res = await fetch('/api/user/empregos/candidaturas', {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch candidaturas')
  return res.json()
}

function MinhasCandidaturasSkeleton() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Minhas candidaturas" />
      <div className="px-4 pt-2 md:pt-0 flex flex-col gap-2 md:grid md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
    </main>
  )
}

export function MinhasCandidaturasPageClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidaturas'],
    queryFn: fetchCandidaturas,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <MinhasCandidaturasSkeleton />

  return (
    <MinhasCandidaturasContent
      candidaturas={data?.candidaturas ?? []}
      hasError={isError}
    />
  )
}
