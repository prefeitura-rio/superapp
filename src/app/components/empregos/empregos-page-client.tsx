'use client'

import { AllVagas } from './all-vagas'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'

interface EmpregosPageClientProps {
  vagas: VagaCardData[]
}

export function EmpregosPageClient({ vagas }: EmpregosPageClientProps) {
  const recentlyAddedVagas = vagas.slice(0, 4)
  const allVagas = vagas

  return (
    <>
      <RecentlyAddedVagas vagas={recentlyAddedVagas} />
      <AllVagas vagas={allVagas} />
    </>
  )
}
