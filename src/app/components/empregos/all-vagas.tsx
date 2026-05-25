'use client'

import { useState } from 'react'
import { useVagas } from './use-vagas'
import { VagaCard } from './vaga-card'
import { type VagaFilterState, VagaFilters } from './vaga-filters'

export function AllVagas() {
  const [activeFilters, setActiveFilters] = useState<VagaFilterState>({})

  const { data: vagas = [], isLoading, isError } = useVagas(activeFilters)

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Encontre sua vaga
      </h3>
      <VagaFilters onFiltersChange={setActiveFilters} />

      {isLoading && (
        <div className="mt-4 px-4 pb-6 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-41 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="mt-4 px-4 pb-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            Erro ao carregar vagas. Tente novamente.
          </p>
        </div>
      )}

      {!isLoading && !isError && vagas.length === 0 && (
        <div className="mt-4 px-4 pb-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma vaga encontrada para os filtros selecionados.
          </p>
        </div>
      )}

      {!isLoading && !isError && vagas.length > 0 && (
        <>
          {/* Mobile: layout empilhado, cards h-41 w-auto (10.25rem altura) */}
          <div className="mt-4 px-4 pb-6 max-[576px]:block min-[577px]:hidden">
            <div className="flex flex-col gap-4">
              {vagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  variant="all"
                  className="w-full h-41 min-h-41"
                />
              ))}
            </div>
          </div>
          {/* Desktop: grid 2 colunas */}
          <div className="hidden mt-4 min-[577px]:block px-4 pb-6">
            <div className="grid grid-cols-2 gap-2">
              {vagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  variant="all"
                  className="w-full min-h-41"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
