'use client'

import { AllVagas } from './all-vagas'
import { CandidaturasEnviadasCtaCard } from './candidaturas-enviadas-cta-card'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'
import { separateVagas } from './vagas-utils'

interface EmpregosPageClientProps {
  vagas: VagaCardData[]
  hasCandidaturas?: boolean
}

export function EmpregosPageClient({
  vagas,
  hasCandidaturas = false,
}: EmpregosPageClientProps) {
  const { recentVagas, allVagas } = separateVagas(vagas)

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
