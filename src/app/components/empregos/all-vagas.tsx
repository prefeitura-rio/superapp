'use client'

import { Pagination } from '@/components/ui/pagination'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { VAGAS_PAGE_SIZE, useVagas } from './use-vagas'
import { VagaCard } from './vaga-card'
import { type VagaFilterState, VagaFilters } from './vaga-filters'

export function AllVagas() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const [activeFilters, setActiveFilters] = useState<VagaFilterState>({})

  const { data, isLoading, isError } = useVagas(
    activeFilters,
    page,
    VAGAS_PAGE_SIZE
  )

  const vagas = data?.vagas ?? []
  const totalPages = data?.totalPages ?? 1

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextPage <= 1) params.delete('page')
      else params.set('page', String(nextPage))

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  const handleFiltersChange = useCallback(
    (filters: VagaFilterState) => {
      setActiveFilters(filters)
      // Reset to first page when filters change
      if (page !== 1) {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('page')
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      }
    },
    [page, pathname, router, searchParams]
  )

  // Clamp page if filters reduce total pages
  useEffect(() => {
    if (!data) return
    if (page > data.totalPages && data.totalPages >= 1) {
      handlePageChange(data.totalPages)
    }
  }, [data, page, handlePageChange])

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Encontre seu trabalho
      </h3>
      <VagaFilters onFiltersChange={handleFiltersChange} />

      {isLoading && (
        <div className="mt-4 px-4 pb-6 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[200px] rounded-2xl bg-muted animate-pulse"
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
          <div className="mt-4 px-4 max-[576px]:block min-[577px]:hidden">
            <div className="flex flex-col gap-4">
              {vagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  variant="all"
                  className="w-full h-[200px]"
                />
              ))}
            </div>
          </div>
          {/* Desktop: grid 2 colunas */}
          <div className="hidden mt-4 min-[577px]:block px-4">
            <div className="grid grid-cols-2 gap-2">
              {vagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  variant="all"
                  className="w-full h-[200px]"
                />
              ))}
            </div>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="pt-12 px-4"
          />
        </>
      )}
    </>
  )
}
