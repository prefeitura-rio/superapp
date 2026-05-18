'use client'

import { useQuery } from '@tanstack/react-query'
import { AllVagas } from './all-vagas'
import { CandidaturasEnviadasCtaCard } from './candidaturas-enviadas-cta-card'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'
import { separateVagas } from './vagas-utils'

async function fetchCandidaturas() {
  const res = await fetch('/api/user/empregos/candidaturas', {
    cache: 'no-store',
  })
  if (!res.ok) return { hasCandidaturas: false }
  return res.json()
}

interface EmpregosPageClientProps {
  vagas: VagaCardData[]
}

export function EmpregosPageClient({ vagas }: EmpregosPageClientProps) {
  const { recentVagas, allVagas } = separateVagas(vagas)

  const { data } = useQuery({
    queryKey: ['candidaturas'],
    queryFn: fetchCandidaturas,
    staleTime: 5 * 60 * 1000,
  })

  const hasCandidaturas = data?.hasCandidaturas ?? false

  if (vagas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 pt-24">
        <p className="text-lg text-muted-foreground text-center">
          Nenhuma vaga de emprego encontrada
        </p>
      </div>
    )
  }

  return (
    <>
      {hasCandidaturas && (
        <div className="px-4 pb-4">
          <CandidaturasEnviadasCtaCard />
        </div>
      )}
      <RecentlyAddedVagas vagas={recentVagas} />
      <AllVagas vagas={allVagas} />
    </>
  )
}
