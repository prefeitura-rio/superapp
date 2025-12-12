'use client'

import { ExternalLinkDrawer } from '@/app/components/drawer-contents/external-link-drawer'
import { SearchResultSkeleton } from '@/app/components/search-result-skeleton'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { SearchResultItem } from '@/helpers/search-helpers'
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSearch } from './hooks/use-search'
import {
  handleBackNavigation,
  handleSearchItemClick as handleItemClick,
} from './utils/navigation-helpers'

export default function Search() {
  const router = useRouter()
  const [externalLinkDrawerOpen, setExternalLinkDrawerOpen] = useState(false)
  const [selectedExternalUrl, setSelectedExternalUrl] = useState<string>('')

  const {
    query,
    results,
    loading,
    isSearching,
    searchHistory,
    setQuery,
    onQueryChange,
    handleSearch,
    clearSearch,
    removeFromHistory,
    searchInputRef,
  } = useSearch()

  const handleBack = () => {
    handleBackNavigation(router)
  }

  const handleSearchItemClick = (item: SearchResultItem) => {
    handleItemClick(item, query, router, url => {
      setSelectedExternalUrl(url)
      setExternalLinkDrawerOpen(true)
    })
  }

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

      {/* Results or Suggestions */}
      <div className="text-white space-y-3 mt-6">
        {loading || isSearching ? (
          <div>
            <h2 className="text-base text-foreground font-medium">
              Resultados da Pesquisa
            </h2>
            <SearchResultSkeleton />
          </div>
        ) : query.length > 2 ? (
          <div>
            {results && results.length > 0 ? (
              <>
                <h2 className="text-base text-foreground font-medium">
                  Resultados da Pesquisa
                </h2>
                <ul className="space-y-2 pt-4">
                  {results
                    .filter(item => item.tipo !== 'noticia')
                    .map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-300 flex justify-between items-center p-4 bg-card hover:bg-card/70 rounded-lg cursor-pointer"
                        onClick={() => handleSearchItemClick(item)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSearchItemClick(item)
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-card-foreground line-clamp-2 text-sm font-normal leading-5">
                              {item.titulo}
                            </div>
                            {item.tipo === 'curso' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                Curso
                              </span>
                            )}
                            {item.tipo === 'job' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                Emprego
                              </span>
                            )}
                            {item.tipo === 'link_externo' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                Link externo
                              </span>
                            )}
                          </div>
                          <div className="pt-1 line-clamp-2 text-muted-foreground text-xs font-normal leading-4">
                            {item.descricao}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </>
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
          </div>
        ) : (
          <div>
            <h2 className="text-base font-medium text-foreground">
              Mais pesquisados
            </h2>
            <ul>
              {[
                'Quero pagar meu IPTU',
                'Matricular meu filho na escola',
                'Procurar emprego',
                'Cadastrar evento',
              ].map((text, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer"
                  onClick={() => {
                    // Send GA event for popular search click
                    sendGAEvent('event', 'mais_pesquisados_click', {
                      search_query: text,
                      event_timestamp: new Date().toISOString(),
                    })
                    setQuery(text)
                    handleSearch(text)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      // Send GA event for popular search click
                      sendGAEvent('event', 'mais_pesquisados_click', {
                        search_query: text,
                        event_timestamp: new Date().toISOString(),
                      })
                      setQuery(text)
                      handleSearch(text)
                    }
                  }}
                >
                  <span>{text}</span>
                  <ChevronRightIcon className="text-primary h-6 w-6" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Show search history only if there are items and not searching */}
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

      {/* External Link Drawer */}
      <ExternalLinkDrawer
        open={externalLinkDrawerOpen}
        onOpenChange={setExternalLinkDrawerOpen}
        externalUrl={selectedExternalUrl}
      />
    </div>
  )
}
