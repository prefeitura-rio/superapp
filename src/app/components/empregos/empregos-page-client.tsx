'use client'

import { AllVagas } from './all-vagas'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'
import { separateVagas } from './vagas-utils'

interface EmpregosPageClientProps {
  vagas: VagaCardData[]
}

export function EmpregosPageClient({ vagas }: EmpregosPageClientProps) {
  const { recentVagas, allVagas } = separateVagas(vagas)

  return (
    <>
      <RecentlyAddedVagas vagas={recentVagas} />
      <AllVagas vagas={allVagas} />
    </>
  )
}
