'use client'

import { ExternalLinkDrawer } from '@/app/components/drawer-contents/external-link-drawer'
import { SearchResultSkeleton } from '@/app/components/search-result-skeleton'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import { sendGAEvent } from '@next/third-parties/google'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { CatalogSearchContext } from './hooks/use-catalog-search'
import {
  saveCatalogHistory,
  useCatalogSearch,
} from './hooks/use-catalog-search'
import {
  handleBackNavigation,
  handleCatalogItemClick as handleItemClick,
} from './utils/navigation-helpers'

type SuggestItem = { title: string; slug: string; url: string }

type CatalogResultItem = ModelsSearchItem & {
  reason?: string | null
  match_reason?: string | null
}

type AiSummarySegment = {
  text: string
  slug?: string | null
  url?: string | null
}

type AiSummary = {
  query: string
  segments: AiSummarySegment[]
  generated: boolean
}

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
    label: 'Trabalho',
    className: 'bg-green-500/10 text-green-500 border border-green-500/20',
  },
  mei_opportunity: {
    label: 'MEI',
    className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  },
}

const STATIC_POPULAR: { title: string; href: string }[] = [
  { title: 'IPTU 2026', href: '/servicos/categoria/taxas/iptu-2025-94ff5567' },
  {
    title: 'CADRio Agendamento',
    href: '/servicos/categoria/cidadania/inscricao-e-atualizacao-do-cadastro-unico-8cafda60',
  },
  {
    title: 'Consulta de Multas',
    href: '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90',
  },
  {
    title: 'Alvará: Consulta prévia de local',
    href: '/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969',
  },
  {
    title: 'Licença Sanitária de Funcionamento',
    href: '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857',
  },
  {
    title: 'Dívida Ativa: Débitos de IPTU',
    href: '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610',
  },
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
  item: CatalogResultItem
  onClick: () => void
}) {
  const badge = item.type ? TYPE_BADGE[item.type] : undefined
  const metadataDescription = (
    item.metadata as Record<string, unknown> | undefined
  )?.description as string | undefined
  const description =
    metadataDescription ||
    item.short_desc ||
    (item.tags && item.tags.length > 0 ? item.tags[0] : '')
  const reason = item.reason
  const matchReason = item.match_reason

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
        {reason && (
          <div className="pt-1 text-[11px] italic text-primary/70">
            {reason}
          </div>
        )}
        {matchReason && (
          <div className="pt-1 text-[11px] font-medium text-primary/80">
            {matchReason}
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
  const [dynamicSuggestions, setDynamicSuggestions] = useState<
    ModelsSearchItem[]
  >([])
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
    lowConfidence,
    suggestedQueries,
    recommendations,
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

  // Typeahead autocomplete (facilita /api/v1/suggest via /api/suggest)
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    suggestTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!res.ok) return
        const data = await res.json()
        setSuggestions((data.suggestions as SuggestItem[]) || [])
        setHighlightedIndex(-1)
      } catch {
        // aborted (stale query) or network error — ignore
      }
    }, 180)
    return () => {
      if (suggestTimeout.current) clearTimeout(suggestTimeout.current)
      controller.abort()
    }
  }, [query])

  // AI search summary (facilita /api/v1/summarize via /api/summary) — debounced
  // longer than autocomplete since each call hits Gemini; the box hides itself when
  // the backend returns generated:false (feature off / keyless / model failure).
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length <= 2) {
      setSummary(null)
      setSummaryLoading(false)
      return
    }
    const controller = new AbortController()
    setSummaryLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/summary?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
          }
        )
        if (!res.ok) {
          setSummary(null)
          return
        }
        const data = (await res.json()) as AiSummary
        setSummary(data?.generated ? data : null)
      } catch {
        // aborted (stale query) or network error — ignore
      } finally {
        if (!controller.signal.aborted) setSummaryLoading(false)
      }
    }, 600)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const CONTEXT_BACK_ROUTE: Record<CatalogSearchContext, string> = {
    servicos: '/servicos',
    empregos: '/servicos/trabalho',
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

  const logoHref =
    context === 'empregos' ? '/servicos/trabalho' : '/servicos/cursos'

  const suggestionsOpen =
    showSuggestions && suggestions.length > 0 && query.trim().length >= 2

  const selectSuggestion = (suggestion: SuggestItem) => {
    setShowSuggestions(false)
    saveCatalogHistory(suggestion.title)
    router.push(suggestion.url)
  }

  return (
    <div className="min-h-lvh max-w-4xl px-4 mx-auto pt-6 flex flex-col pb-4">
      {(context === 'empregos' || context === 'cursos') && (
        <div className="flex justify-center mb-8">
          <Link href={logoHref}>
            <Image
              src={oportunidadesCariocasLogoDark}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:block hidden"
            />
            <Image
              src={oportunidadesCariocasLogo}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:hidden block"
            />
          </Link>
        </div>
      )}
      <div className="relative">
        <SearchInput
          ref={searchInputRef}
          placeholder="Do que você precisa?"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onBack={handleBack}
          onClear={clearSearch}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          role="combobox"
          aria-expanded={suggestionsOpen}
          aria-controls="suggest-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `suggest-opt-${highlightedIndex}`
              : undefined
          }
          onKeyDown={e => {
            if (!suggestionsOpen) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlightedIndex(i => (i + 1) % suggestions.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlightedIndex(i =>
                i <= 0 ? suggestions.length - 1 : i - 1
              )
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
              e.preventDefault()
              selectSuggestion(suggestions[highlightedIndex])
            } else if (e.key === 'Escape') {
              setShowSuggestions(false)
            }
          }}
        />
        {suggestionsOpen && (
          <div
            id="suggest-listbox"
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.slug}
                id={`suggest-opt-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`line-clamp-1 cursor-pointer px-4 py-2.5 text-sm text-foreground ${
                  index === highlightedIndex ? 'bg-card/70' : 'hover:bg-card/70'
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={() => selectSuggestion(suggestion)}
              >
                {suggestion.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-white space-y-3 mt-6">
        {/* AI summary (Gemini) — rendered above results from the moment a query
            starts, so the loading indicator is visible throughout generation */}
        {hasQuery && (summaryLoading || summary) && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary/80">
              <span aria-hidden="true">✨</span> Resumo por IA
              {summaryLoading && (
                <span
                  role="status"
                  aria-label="Gerando resumo"
                  className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                />
              )}
            </div>
            {summary ? (
              <p className="text-sm leading-5 text-foreground">
                {summary.segments.map((segment, index) =>
                  segment.url ? (
                    <Link
                      key={`seg-${index}`}
                      href={segment.url}
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {segment.text}
                    </Link>
                  ) : (
                    <span key={`seg-${index}`}>{segment.text}</span>
                  )
                )}
              </p>
            ) : (
              <div className="space-y-1.5" aria-hidden="true">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            )}
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Resumo gerado por IA — confira sempre nos serviços oficiais.
            </p>
          </div>
        )}
        {isLoading ? (
          <div>
            <h2 className="text-base text-foreground font-medium">
              Resultados da Pesquisa
            </h2>
            <SearchResultSkeleton />
          </div>
        ) : hasQuery ? (
          <>
            {/* Low-confidence / out-of-scope notice */}
            {lowConfidence && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                Baixa confiança: sua busca pode estar fora do escopo dos
                serviços cadastrados. Tente reformular ou use uma sugestão
                abaixo.
              </div>
            )}

            {/* "Você quis dizer" suggested queries */}
            {suggestedQueries.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Você quis dizer
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setQuery(suggestion)
                        handleSearch(suggestion)
                      }}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground hover:bg-card/70"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Serviços relacionados (recommendations) */}
            {recommendations.length > 0 && (
              <div className="pt-4">
                <h2 className="text-base text-foreground font-medium">
                  Serviços relacionados
                </h2>
                <ul className="space-y-2 pt-4">
                  {recommendations.map((item, index) => (
                    <ResultItem
                      key={item.id ?? `rec-${index}`}
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
            {isDynamicContext &&
              (suggestionsLoading ? (
                <ul>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center py-4 border-b border-border"
                    >
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
              ))}
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
