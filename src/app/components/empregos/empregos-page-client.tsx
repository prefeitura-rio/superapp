'use client'

import { useQuery } from '@tanstack/react-query'
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
      <RecentlyAddedVagas vagas={recentVagas} />
      <AllVagas />
    </>
  )
}
