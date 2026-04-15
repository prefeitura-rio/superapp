'use client'

import type { VagaCardData } from './vaga-card'
import { VagaCard } from './vaga-card'

interface AllVagasProps {
  vagas: VagaCardData[]
}

export function AllVagas({ vagas }: AllVagasProps) {
  if (vagas.length === 0) return null

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Todas as vagas
      </h3>
      {/* Mobile: layout empilhado, cards h-41 w-auto (10.25rem altura) */}
      <div className="px-4 pb-6 max-[576px]:block min-[577px]:hidden">
        <div className="flex flex-col gap-4">
          {vagas.map(vaga => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              variant="all"
              className="w-full h-[10.25rem] min-h-[10.25rem]"
            />
          ))}
        </div>
      </div>
      {/* Desktop: grid 2 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {vagas.map(vaga => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              variant="all"
              className="w-full min-h-[10.25rem]"
            />
          ))}
        </div>
      </div>
    </>
  )
}
