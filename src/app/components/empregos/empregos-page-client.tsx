'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AllVagas } from './all-vagas'
import { AreaCandidato } from './area-candidato/area-candidato'
import { RecentlyAddedVagas } from './recently-added-vagas'
import type { VagaCardData } from './vaga-card'

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
  return (
    <>
      <h1 className="sr-only">Trabalho</h1>
      <div className="px-4 pb-4">
        <AreaCandidato />
      </div>
      <Suspense fallback={null}>
        <RecentlyAddedVagasOnFirstPage vagas={recentVagas} />
      </Suspense>
      <Suspense fallback={null}>
        <AllVagas />
      </Suspense>
    </>
  )
}
