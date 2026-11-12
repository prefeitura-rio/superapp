'use client'

import { SearchIcon } from '@/assets/icons'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { RadioList } from '@/components/ui/custom/radio-list'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CatalogoItem } from './catalogo'
import {
  areaFixaQueryOptions,
  areasAtuacaoQueryOptions,
} from './habilidades-competencias-queries'

interface AreaAtuacaoSheetProps {
  selectedId?: number
  onSelect: (area: CatalogoItem) => void
  onClose?: () => void
}

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

export function AreaAtuacaoSheet({
  selectedId,
  onSelect,
  onClose,
}: AreaAtuacaoSheetProps) {
  const [termo, setTermo] = useState('')
  const busca = useDebounced(termo, 300)
  const buscaVazia = busca.trim() === ''
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(areasAtuacaoQueryOptions(busca))
  const areaFixa = useQuery({
    ...areaFixaQueryOptions(),
    enabled: buscaVazia,
  })
  const carregadas = data?.pages.flatMap(page => page.data) ?? []
  const fixa = buscaVazia ? (areaFixa.data ?? null) : null
  const areas = fixa
    ? [fixa, ...carregadas.filter(item => item.id !== fixa.id)]
    : carregadas
  const aguardandoLista =
    (buscaVazia && areaFixa.isLoading) ||
    (isFetching && carregadas.length === 0)

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          void fetchNextPage()
        }
      },
      { root }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const selecionar = (id: string) => {
    const area = areas.find(item => String(item.id) === id)
    if (!area) return
    onSelect(area)
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-6">
      <CustomInput
        id="buscar-area-atuacao"
        value={termo}
        onChange={event => setTermo(event.target.value)}
        placeholder="Pesquisar"
        aria-label="Pesquisar"
        className="w-full bg-card"
        leftIcon={
          <SearchIcon
            data-testid="area-atuacao-search-icon"
            width={24}
            height={24}
            className="size-6 stroke-[1.4] text-card-foreground"
            aria-hidden="true"
          />
        }
      />

      <div ref={scrollRef} className="max-h-80 overflow-y-auto">
        {aguardandoLista ? (
          <div
            className="flex flex-col gap-4"
            aria-busy="true"
            aria-label="Buscando áreas"
          >
            {Array.from({ length: 10 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-full" />
            ))}
          </div>
        ) : areas.length > 0 ? (
          <>
            <RadioList
              options={areas.map(area => ({
                label: area.nome,
                value: String(area.id),
              }))}
              value={selectedId != null ? String(selectedId) : ''}
              onValueChange={selecionar}
              name="area-atuacao"
            />
            <div ref={sentinelRef} className="h-px" />
            {isFetchingNextPage && (
              <div className="flex justify-center pt-4">
                <Loader2
                  className="size-6 stroke-[1.4] animate-spin text-muted-foreground"
                  aria-label="Carregando mais áreas"
                />
              </div>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma área encontrada
          </p>
        )}
      </div>
    </div>
  )
}
