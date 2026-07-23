'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { CheckboxList } from '@/components/ui/custom/checkbox-list'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { RadioList } from '@/components/ui/custom/radio-list'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VAGA_FILTERS } from './vaga-filter-config'

export type VagaFilterState = Record<string, string | string[]>

// ---------------------------------------------------------------------------
// Infinite-scroll paginado para Bairros (lista estática no servidor)
// ---------------------------------------------------------------------------
interface BairrosPage {
  data: string[]
  meta: { has_more: boolean; page: number }
}

function useBairrosInfinite(search: string, enabled: boolean) {
  return useInfiniteQuery<BairrosPage>({
    queryKey: ['empregos-bairros', search],
    queryFn: async ({ pageParam = 1 }) => {
      const qs = new URLSearchParams({ page: String(pageParam) })
      if (search) qs.set('search', search)
      const res = await fetch(`/api/empregos/bairros?${qs}`)
      if (!res.ok) return { data: [], meta: { has_more: false, page: 1 } }
      return res.json()
    },
    getNextPageParam: last =>
      last.meta.has_more ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 60 * 60 * 1000,
  })
}

// ---------------------------------------------------------------------------
// Infinite-scroll paginado para Empresas (proxy autenticado)
// ---------------------------------------------------------------------------
interface EmpresaItem {
  cnpj?: string
  nome_fantasia?: string
  razao_social?: string
}
interface EmpresasPage {
  data: EmpresaItem[]
  meta: { page: number; page_size: number; total: number }
}

function useEmpresasInfinite(search: string, enabled: boolean) {
  return useInfiniteQuery<EmpresasPage>({
    queryKey: ['empregos-empresas', search],
    queryFn: async ({ pageParam = 1 }) => {
      const qs = new URLSearchParams({
        page: String(pageParam),
        page_size: '10',
      })
      if (search) qs.set('search', search)
      const res = await fetch(`/api/empregos/empresas?${qs}`)
      if (!res.ok)
        return { data: [], meta: { page: 1, page_size: 10, total: 0 } }
      return res.json()
    },
    getNextPageParam: (last, all) => {
      const loaded = all.flatMap(p => p.data).length
      return loaded < last.meta.total ? last.meta.page + 1 : undefined
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// ---------------------------------------------------------------------------
// Hook de debounce
// ---------------------------------------------------------------------------
function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ---------------------------------------------------------------------------
// Lista com busca + infinite scroll genérica (checkbox)
// ---------------------------------------------------------------------------
interface InfiniteCheckListProps {
  items: { label: string; value: string }[]
  hasMore: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  value: string[]
  onValueChange: (vals: string[]) => void
  query: string
  onQueryChange: (q: string) => void
  placeholder: string
}

function InfiniteCheckList({
  items,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  value,
  onValueChange,
  query,
  onQueryChange,
  placeholder,
}: InfiniteCheckListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node || !hasMore) return
      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) onLoadMore()
        },
        { threshold: 0, rootMargin: '100px' }
      )
      observerRef.current.observe(node)
    },
    [hasMore, onLoadMore]
  )

  function handleToggle(itemValue: string, checked: boolean) {
    const next = checked
      ? [...value, itemValue]
      : value.filter(v => v !== itemValue)
    onValueChange(next)
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="shrink-0">
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={placeholder}
          style={{
            borderWidth: '1.4px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            height: '32px',
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingLeft: '20px',
            paddingRight: '20px',
            boxSizing: 'content-box',
            width: 'calc(100% - 40px)',
          }}
          className={cn(
            'w-full rounded-[12px] bg-background',
            'text-sm font-normal leading-5 tracking-normal text-foreground',
            'placeholder:text-muted-foreground placeholder:text-sm placeholder:font-normal placeholder:leading-5 placeholder:tracking-normal',
            'focus:outline-none transition-colors'
          )}
        />
      </div>
      <div className="overflow-y-auto flex-1 min-h-0 mt-6">
        {/* Skeleton: primeira carga ou nova query (isLoading=true) */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Lista de itens */}
        {!isLoading &&
          items.map(item => (
            <label
              key={item.value}
              htmlFor={`infinite-check-${item.value}`}
              className="flex items-center justify-between cursor-pointer py-2 rounded-md transition-colors hover:bg-accent/40"
            >
              <span className="text-sm text-foreground truncate pr-4">
                {item.label}
              </span>
              <Checkbox
                id={`infinite-check-${item.value}`}
                checked={value.includes(item.value)}
                onCheckedChange={checked =>
                  handleToggle(item.value, checked === true)
                }
              />
            </label>
          ))}

        {/* Spinner de próxima página (infinite scroll) */}
        {!isLoading && isFetchingNextPage && (
          <div className="flex flex-col gap-2 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Sentinel para infinite scroll */}
        {!isLoading && hasMore && <div ref={sentinelRef} className="h-4" />}

        {/* Empty state: só quando de fato não há resultados */}
        {!isLoading && !isFetchingNextPage && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum resultado.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bottom-sheet de Localização
// ---------------------------------------------------------------------------
interface LocalizacaoSheetProps {
  value: string[]
  onValueChange: (vals: string[]) => void
}

function LocalizacaoSheet({ value, onValueChange }: LocalizacaoSheetProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useBairrosInfinite(debouncedQuery, true)

  const items = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap(p => p.data)
        .map(b => ({ label: b, value: b })),
    [data]
  )

  return (
    <InfiniteCheckList
      items={items}
      hasMore={!!hasNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      value={value}
      onValueChange={onValueChange}
      query={query}
      onQueryChange={q => {
        setQuery(q)
      }}
      placeholder="Encontre o bairro desejado"
    />
  )
}

// ---------------------------------------------------------------------------
// Bottom-sheet de Empresa
// ---------------------------------------------------------------------------
interface EmpresaSheetProps {
  value: string[]
  onValueChange: (vals: string[]) => void
}

function EmpresaSheet({ value, onValueChange }: EmpresaSheetProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmpresasInfinite(debouncedQuery, true)

  const items = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap(p => p.data)
        .map(e => ({
          label: e.nome_fantasia || e.razao_social || e.cnpj || '',
          value: e.nome_fantasia || e.razao_social || e.cnpj || '',
        }))
        .filter(e => e.value),
    [data]
  )

  return (
    <InfiniteCheckList
      items={items}
      hasMore={!!hasNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      value={value}
      onValueChange={onValueChange}
      query={query}
      onQueryChange={q => {
        setQuery(q)
      }}
      placeholder="Encontre a empresa desejada"
    />
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
interface VagaFiltersProps {
  onFiltersChange?: (filters: VagaFilterState) => void
}

export function VagaFilters({ onFiltersChange }: VagaFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filterState, setFilterState] = useState<VagaFilterState>({})
  const [draftValue, setDraftValue] = useState<string | string[]>('')

  const currentFilter = VAGA_FILTERS.find(f => f.id === activeFilter)

  function openFilter(id: string) {
    const current = filterState[id]
    const filter = VAGA_FILTERS.find(f => f.id === id)
    if (!filter) return
    if (filter.type === 'multiple') {
      setDraftValue(Array.isArray(current) ? current : [])
    } else {
      setDraftValue(typeof current === 'string' ? current : '')
    }
    setActiveFilter(id)
  }

  function handleApply() {
    if (!activeFilter) return
    const next = { ...filterState, [activeFilter]: draftValue }
    setFilterState(next)
    onFiltersChange?.(next)
    setActiveFilter(null)
  }

  function handleClear() {
    const currentFilter = VAGA_FILTERS.find(f => f.id === activeFilter)
    if (!currentFilter) return
    setDraftValue(currentFilter.type === 'multiple' ? [] : '')
  }

  function getSelectionCount(id: string): number {
    const val = filterState[id]
    return Array.isArray(val) ? val.length : 0
  }

  function hasSelection(id: string): boolean {
    const val = filterState[id]
    if (Array.isArray(val)) return val.length > 0
    return typeof val === 'string' && val !== ''
  }

  const draftArray = Array.isArray(draftValue) ? draftValue : []
  const draftString = typeof draftValue === 'string' ? draftValue : ''
  const isSearchable = currentFilter?.searchable
  const hasDivider = currentFilter?.id !== 'data_publicacao'

  return (
    <>
      {/* Pills row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {VAGA_FILTERS.map(filter => {
          const selected = hasSelection(filter.id)
          const count = getSelectionCount(filter.id)
          const isOpen = activeFilter === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => openFilter(filter.id)}
              className={cn(
                'flex h-8 items-center gap-1.5 px-4 rounded-full border whitespace-nowrap transition-colors shrink-0 cursor-pointer',
                'text-sm font-normal leading-5 tracking-normal',
                selected
                  ? 'border-foreground bg-card'
                  : 'border-border bg-background hover:border-muted-foreground active:border-muted-foreground'
              )}
            >
              {filter.label}
              {filter.type === 'multiple' && count > 0 && (
                <span className="bg-white text-foreground rounded-full px-1.5 text-sm font-normal leading-5 min-w-5 text-center">
                  {count}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'size-3.5 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
          )
        })}
      </div>

      <Drawer
        open={activeFilter !== null}
        onOpenChange={open => {
          if (!open) setActiveFilter(null)
        }}
      >
        <DrawerContent
          className={cn(
            'max-w-4xl mx-auto rounded-t-3xl! pb-0',
            isSearchable ? 'h-[70vh] flex flex-col' : 'flex flex-col'
          )}
        >
          <DrawerTitle className="sr-only">
            {currentFilter?.label ?? 'Filtro'}
          </DrawerTitle>
          {/* Handle */}
          <div className="flex justify-center pt-8 pb-6 shrink-0">
            <div className="w-8.5 h-1 rounded-full bg-popover-line" />
          </div>

          {/* Conteúdo */}
          <div
            className={cn(
              'px-8',
              isSearchable
                ? 'flex flex-col flex-1 min-h-0 overflow-hidden'
                : 'overflow-y-auto max-h-[70vh]'
            )}
          >
            {activeFilter === 'localizacao' && (
              <LocalizacaoSheet
                value={draftArray}
                onValueChange={vals => setDraftValue(vals)}
              />
            )}

            {activeFilter === 'empresa' && (
              <EmpresaSheet
                value={draftArray}
                onValueChange={vals => setDraftValue(vals)}
              />
            )}

            {currentFilter &&
              !isSearchable &&
              currentFilter.type === 'single' && (
                <RadioList
                  name={`filter-${currentFilter.id}`}
                  options={currentFilter.options}
                  value={draftString}
                  onValueChange={val => setDraftValue(val)}
                />
              )}

            {currentFilter &&
              !isSearchable &&
              currentFilter.type === 'multiple' && (
                <CheckboxList
                  name={`filter-${currentFilter.id}`}
                  options={currentFilter.options}
                  value={draftArray}
                  onValueChange={vals => setDraftValue(vals)}
                />
              )}
          </div>

          {hasDivider && <div className="h-px bg-border mt-6 shrink-0" />}

          <DrawerFooter className="flex-row gap-2 px-8 pt-6 pb-10 shrink-0">
            <CustomButton
              variant="secondary"
              onClick={handleClear}
              size="lg"
              className="flex-1"
            >
              Limpar
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleApply}
              size="lg"
              className="flex-1"
            >
              Aplicar
            </CustomButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
