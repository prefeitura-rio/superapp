'use client'

import { ExternalLinkDrawer } from '@/app/components/drawer-contents/external-link-drawer'
import { SearchResultSkeleton } from '@/app/components/search-result-skeleton'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { CatalogSearchContext } from './hooks/use-catalog-search'
import { saveCatalogHistory, useCatalogSearch } from './hooks/use-catalog-search'
import {
  handleBackNavigation,
  handleCatalogItemClick as handleItemClick,
} from './utils/navigation-helpers'

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  service: {
    label: 'Serviço',
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  course: {
    label: 'Curso',
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
  job: {
    label: 'Emprego',
    className: 'bg-green-500/10 text-green-500 border border-green-500/20',
  },
  mei_opportunity: {
    label: 'MEI',
    className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  },
}

const STATIC_POPULAR: { title: string; href: string }[] = [
  { title: 'IPTU 2026', href: '/servicos/categoria/taxas/iptu-2025-94ff5567' },
  { title: 'CADRio Agendamento', href: '/servicos/categoria/familia/cadrio-agendamento-770618f7' },
  { title: 'Consulta de Multas', href: '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90' },
  { title: 'Alvará: Consulta prévia de local', href: '/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969' },
  { title: 'Licença Sanitária de Funcionamento', href: '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857' },
  { title: 'Dívida Ativa: Débitos de IPTU', href: '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610' },
]

const DYNAMIC_CONTEXT_TYPE: Record<string, string> = {
  empregos: 'job',
  mei: 'mei_opportunity',
  cursos: 'course',
}

async function fetchSuggestions(type: string): Promise<ModelsSearchItem[]> {
  const params = new URLSearchParams({ per_page: '4' })
  params.append('types', type)
  const res = await fetch(`/api/catalog-search?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.items as ModelsSearchItem[]) || []
}

function ResultItem({
  item,
  onClick,
}: {
  item: ModelsSearchItem
  onClick: () => void
}) {
  const badge = item.type ? TYPE_BADGE[item.type] : undefined
  const metadataDescription = (item.metadata as Record<string, unknown> | undefined)?.description as string | undefined
  const description =
    metadataDescription || item.short_desc || (item.tags && item.tags.length > 0 ? item.tags[0] : '')

  return (
    <li
      className="text-sm text-gray-300 flex justify-between items-center p-4 bg-card hover:bg-card/70 rounded-lg cursor-pointer"
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-card-foreground line-clamp-2 text-sm font-normal leading-5">
            {item.title || '—'}
          </div>
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {description && (
          <div className="pt-1 line-clamp-2 text-muted-foreground text-xs font-normal leading-4">
            {description}
          </div>
        )}
      </div>
    </li>
  )
}

export default function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [externalLinkDrawerOpen, setExternalLinkDrawerOpen] = useState(false)
  const [selectedExternalUrl, setSelectedExternalUrl] = useState<string>('')
  const [dynamicSuggestions, setDynamicSuggestions] = useState<ModelsSearchItem[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const tipoParam = searchParams.get('tipo') as CatalogSearchContext | null
  const context: CatalogSearchContext | null =
    tipoParam && ['servicos', 'empregos', 'cursos', 'mei'].includes(tipoParam)
      ? tipoParam
      : null

  const isDynamicContext = context !== null && context in DYNAMIC_CONTEXT_TYPE

  // Fetch suggestions for dynamic contexts (empregos, mei, cursos)
  useEffect(() => {
    if (!isDynamicContext) {
      setDynamicSuggestions([])
      return
    }
    const type = DYNAMIC_CONTEXT_TYPE[context!]
    setSuggestionsLoading(true)
    fetchSuggestions(type)
      .then(setDynamicSuggestions)
      .finally(() => setSuggestionsLoading(false))
  }, [context, isDynamicContext])

  const {
    query,
    primaryResults,
    secondaryResults,
    loading,
    isSearching,
    searchHistory,
    setQuery,
    onQueryChange,
    handleSearch,
    clearSearch,
    removeFromHistory,
    searchInputRef,
  } = useCatalogSearch(context)

  const CONTEXT_BACK_ROUTE: Record<CatalogSearchContext, string> = {
    servicos: '/servicos',
    empregos: '/servicos/empregos',
    cursos: '/servicos/cursos',
    mei: '/servicos/mei',
  }

  const handleBack = () => {
    if (context) {
      router.push(CONTEXT_BACK_ROUTE[context])
    } else {
      handleBackNavigation(router)
    }
  }

  const handleResultClick = (item: ModelsSearchItem) => {
    handleItemClick(item, query, router, (url: string) => {
      setSelectedExternalUrl(url)
      setExternalLinkDrawerOpen(true)
    })
  }

  const isLoading = loading || isSearching
  const hasQuery = query.length > 2
  const hasPrimary = primaryResults.length > 0
  const hasSecondary = secondaryResults.length > 0

  const showStaticPopular = context === 'servicos' || context === null

  return (
    <div className="min-h-lvh max-w-4xl px-4 mx-auto pt-5 flex flex-col pb-4">
      <SearchInput
        ref={searchInputRef}
        placeholder="Do que você precisa?"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onBack={handleBack}
        onClear={clearSearch}
      />

      <div className="text-white space-y-3 mt-6">
        {isLoading ? (
          <div>
            <h2 className="text-base text-foreground font-medium">
              Resultados da Pesquisa
            </h2>
            <SearchResultSkeleton />
          </div>
        ) : hasQuery ? (
          <>
            {/* Primary results – context type */}
            {hasPrimary ? (
              <div>
                <h2 className="text-base text-foreground font-medium">
                  Resultados da Pesquisa
                </h2>
                <ul className="space-y-2 pt-4">
                  {primaryResults.map((item, index) => (
                    <ResultItem
                      key={item.id ?? index}
                      item={item}
                      onClick={() => handleResultClick(item)}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center justify-center py-8">
                <ThemeAwareVideo
                  source={VIDEO_SOURCES.emptyAddress}
                  containerClassName="mb-6 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
                />
                <p className="text-lg text-muted-foreground">
                  Ops... nenhum resultado encontrado para a sua busca
                </p>
              </div>
            )}

            {/* Secondary results – other types */}
            {hasSecondary && (
              <div className={hasPrimary ? 'pt-4' : ''}>
                <h2 className="text-base text-foreground font-medium">
                  Você também pode estar procurando
                </h2>
                <ul className="space-y-2 pt-4">
                  {secondaryResults.map((item, index) => (
                    <ResultItem
                      key={item.id ?? index}
                      item={item}
                      onClick={() => handleResultClick(item)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* Mais pesquisados / Mais recentes */
          <div>
            <h2 className="text-base font-medium text-foreground">
              {isDynamicContext ? 'Mais recentes' : 'Mais pesquisados'}
            </h2>

            {/* Static list (default / servicos) */}
            {showStaticPopular && (
              <ul>
                {STATIC_POPULAR.map(({ title, href }) => (
                  <li
                    key={href}
                    className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer"
                    onClick={() => {
                      sendGAEvent('event', 'mais_pesquisados_click', {
                        search_query: title,
                        event_timestamp: new Date().toISOString(),
                      })
                      saveCatalogHistory(title)
                      router.push(href)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        sendGAEvent('event', 'mais_pesquisados_click', {
                          search_query: title,
                          event_timestamp: new Date().toISOString(),
                        })
                        saveCatalogHistory(title)
                        router.push(href)
                      }
                    }}
                  >
                    <span>{title}</span>
                    <ChevronRightIcon className="text-primary h-6 w-6" />
                  </li>
                ))}
              </ul>
            )}

            {/* Dynamic list (empregos / mei / cursos) */}
            {isDynamicContext && (
              suggestionsLoading ? (
                <ul>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex justify-between items-center py-4 border-b border-border">
                      <div className="h-4 w-48 rounded bg-card-foreground/10 animate-pulse" />
                      <div className="h-6 w-6 rounded-full bg-card-foreground/10 animate-pulse" />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {dynamicSuggestions.slice(0, 4).map((item, index) => (
                    <li
                      key={item.id ?? index}
                      className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer"
                      onClick={() => {
                        if (item.title) saveCatalogHistory(item.title)
                        handleResultClick(item)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (item.title) saveCatalogHistory(item.title)
                          handleResultClick(item)
                        }
                      }}
                    >
                      <span>{item.title || '—'}</span>
                      <ChevronRightIcon className="text-primary h-6 w-6" />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>

      {/* Search history */}
      {query.length <= 2 && searchHistory.length > 0 && (
        <div className="pt-6 flex flex-col">
          <h2 className="text-base font-medium text-foreground">
            Pesquisados por você
          </h2>
          <ul>
            {searchHistory.map((text, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer group"
              >
                <span
                  className="flex-1"
                  onClick={() => {
                    setQuery(text)
                    handleSearch(text)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setQuery(text)
                      handleSearch(text)
                    }
                  }}
                >
                  {text}
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    removeFromHistory(text)
                  }}
                  className="text-primary h-5 w-5 hover:text-destructive transition-colors"
                  aria-label={`Remove "${text}" from search history`}
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExternalLinkDrawer
        open={externalLinkDrawerOpen}
        onOpenChange={setExternalLinkDrawerOpen}
        externalUrl={selectedExternalUrl}
      />
    </div>
  )
}
