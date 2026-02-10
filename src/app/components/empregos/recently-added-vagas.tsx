'use client'

import type { VagaCardData } from './vaga-card'
import { VagaCard } from './vaga-card'

interface RecentlyAddedVagasProps {
  vagas: VagaCardData[]
}

export function RecentlyAddedVagas({ vagas }: RecentlyAddedVagasProps) {
  const limitedVagas = vagas.slice(0, 4)

  if (limitedVagas.length === 0) return null

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Vagas mais recentes
      </h3>
      {/* Mobile: cards h-47 w-47 (11.75rem) em linha com scroll horizontal */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[576px]:block min-[577px]:hidden">
        <div className="flex gap-2 px-4 min-w-max">
          {limitedVagas.map((vaga) => (
            <div key={vaga.id} className="shrink-0 h-[11.75rem] w-[11.75rem]">
              <VagaCard
                vaga={vaga}
                variant="recent"
                className="h-full w-full min-h-0"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid 4 colunas responsivo */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-4 gap-2">
          {limitedVagas.map((vaga) => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              variant="recent"
              className="w-full min-h-[11.75rem]"
            />
          ))}
        </div>
      </div>
    </>
  )
}
