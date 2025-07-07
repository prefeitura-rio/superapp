'use client'

import { SearchInput } from '@/components/ui/custom/search-input'
import { ArrowRight, ArrowRightIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SearchResultSkeleton } from '../components/search-result-skeleton'
import { ServiceCategories } from '../components/service-categories'

interface SearchResultItem {
  titulo: string
  tipo: string
  url?: string
  category?: {
    macro: string
    micro: string
    specific: string
  }
  collection?: string
}

interface ApiResponse {
  result: SearchResultItem[]
}

const SEARCH_HISTORY_KEY = 'search-history'
const MAX_HISTORY_ITEMS = 10

export default function Search() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setSearchHistory(parsedHistory)
      } catch (error) {
        console.error('Error parsing search history:', error)
        localStorage.removeItem(SEARCH_HISTORY_KEY)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveSearchToHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length <= 2) return

    const trimmedQuery = searchQuery.trim()

    setSearchHistory(prevHistory => {
      // Remove the query if it already exists (to avoid duplicates)
      const filteredHistory = prevHistory.filter(item => item !== trimmedQuery)
      // Add the new query at the beginning
      const newHistory = [trimmedQuery, ...filteredHistory].slice(
        0,
        MAX_HISTORY_ITEMS
      )

      // Save to localStorage
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))

      return newHistory
    })
  }

  // Remove item from search history
  const removeFromHistory = (itemToRemove: string) => {
    setSearchHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item !== itemToRemove)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const categories = ServiceCategories()

  const handleSearch = async (query: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data: ApiResponse = await response.json()
      setResults(data.result || [])

      // Save to search history after successful search
      saveSearchToHistory(query)
    } catch (error) {
      console.error('Error fetching search results:', error)
      setResults([])
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const onQueryChange = (newQuery: string) => {
    setQuery(newQuery)

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    if (newQuery.length > 2) {
      setIsSearching(true)
      debounceTimeout.current = setTimeout(() => {
        handleSearch(newQuery)
      }, 500) // 500ms delay
    } else {
      setResults([])
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  const displayTipo = (tipo: string) => {
    switch (tipo) {
      case 'servico':
        return 'Serviço'
      case 'informacao':
        return 'Informação'
      case 'noticia':
        return 'Notícia'
      default:
        return tipo
    }
  }

  const displayBreadCrumbCollection = (collection?: string) => {
    if (!collection) return ''
    return collection.split('-').join(' ').toUpperCase()
  }

  return (
    <>
      <div className="max-w-md px-4 mx-auto pt-5 flex flex-col space-y-6 pb-4">
        <SearchInput
          placeholder="Do que você precisa?"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onBack={() => router.back()}
          onClear={clearSearch}
        />

        {/* Results or Suggestions */}
        <div className="text-white space-y-3">
          {loading || isSearching ? (
            <div>
              <h2 className="text-lg text-foreground font-semibold">
                Resultados da Pesquisa
              </h2>
              <SearchResultSkeleton />
            </div>
          ) : query.length > 2 ? (
            <div>
              <h2 className="text-lg text-foreground font-semibold">
                Resultados da Pesquisa
              </h2>
              {results && results.length > 0 ? (
                <ul>
                  {results
                    .filter(item => item.tipo !== 'noticia')
                    .map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-300 flex justify-between items-center py-4 border-b border-neutral-800 cursor-pointer"
                        onClick={() => {
                          if (item.url) {
                            window.open(item.url, '_blank')
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (item.url) {
                              window.open(item.url, '_blank')
                            }
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className="text-foreground mb-1">
                            {item.titulo}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-[#008FBE]">
                            <span className="font-bold">
                              {displayTipo(item.tipo)}
                            </span>
                            {item.category?.macro && (
                              <>
                                <span className="text-gray-500">{'>'}</span>
                                <span className="text-gray-500">
                                  {item.category.macro}
                                </span>
                              </>
                            )}
                            {item.category?.micro && (
                              <>
                                <span className="text-gray-500">{'>'}</span>
                                <span className="text-gray-500">
                                  {item.category.micro}
                                </span>
                              </>
                            )}
                            {item.category?.specific && (
                              <>
                                <span className="text-gray-500">{'>'}</span>
                                <span className="text-gray-500">
                                  {item.category.specific}
                                </span>
                              </>
                            )}
                            {item.collection && (
                              <span className="bg-gray-200 rounded-xl text-xs text-gray-500 px-2 py-0.5">
                                {displayBreadCrumbCollection(item.collection)}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.url && (
                          <ArrowRightIcon className="text-white h-5 w-5" />
                        )}
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-foreground text-center mt-4">
                  Nenhum resultado encontrado
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
                    <span>{text}</span>
                    <ArrowRight className="text-primary h-5 w-5" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Show search history only if there are items and not searching */}
      {query.length <= 2 && searchHistory.length > 0 && (
        <div className="max-w-md px-4 mx-auto pt-4 flex flex-col pb-4">
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
                  className="text-primary h-5 w-5 hover:text-red-500 transition-colors"
                  aria-label={`Remove "${text}" from search history`}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
