'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AllVagas } from './all-vagas'
import { CandidaturasEnviadasCtaCard } from './candidaturas-enviadas-cta-card'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'

async function fetchCandidaturas() {
  const res = await fetch('/api/user/empregos/candidaturas', {
    cache: 'no-store',
  })
  if (!res.ok) return { hasCandidaturas: false }
  return res.json()
}

function RecentlyAddedVagasOnFirstPage({ vagas }: { vagas: VagaCardData[] }) {
  const searchParams = useSearchParams()
  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  if (page > 1) return null

  return <RecentlyAddedVagas vagas={vagas} />
}

interface EmpregosPageClientProps {
  recentVagas: VagaCardData[]
}

export function EmpregosPageClient({ recentVagas }: EmpregosPageClientProps) {
  const { data } = useQuery({
    queryKey: ['candidaturas'],
    queryFn: fetchCandidaturas,
    staleTime: 5 * 60 * 1000,
  })

  const hasCandidaturas = data?.hasCandidaturas ?? false

  return (
    <>
      {hasCandidaturas && (
        <div className="px-4 pb-4">
          <CandidaturasEnviadasCtaCard />
        </div>
      )}
      <Suspense fallback={null}>
        <RecentlyAddedVagasOnFirstPage vagas={recentVagas} />
      </Suspense>
      <Suspense fallback={null}>
        <AllVagas />
      </Suspense>
    </>
  )
}
