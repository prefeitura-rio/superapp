'use client'

import { SearchResultSkeleton } from '@/app/components/search-result-skeleton'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface SearchResultItem {
  titulo: string
  tipo: string
  url?: string
  descricao?: string
  category?: string
  collection?: string
  id?: string
  slug?: string
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
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // Auto-focus the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
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

  const handleBack = () => {
    if (typeof window === 'undefined') {
      router.push('/')
      return
    }

    try {
      // Check sessionStorage for previous route
      const previousRoute = sessionStorage.getItem('previousRoute')
      if (previousRoute) {
        const previousPath = previousRoute.split('?')[0] // Get pathname only
        const currentPath = window.location.pathname

        // Check if previous route is different from current and is from the same app
        if (previousPath && previousPath !== currentPath) {
          // Check if it's not a child route
          const isChildRoute = previousPath.startsWith(`${currentPath}/`)
          if (!isChildRoute) {
            // Valid previous route exists, use router.back()
            router.back()
            return
          }
        }
      }

      // Fallback to document.referrer check
      const referrer = document.referrer
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer)
          const currentUrl = new URL(window.location.href)

          // Check if referrer is from the same domain
          if (referrerUrl.origin === currentUrl.origin) {
            const referrerPath = referrerUrl.pathname
            const currentPath = currentUrl.pathname

            // Check if referrer is different from current page
            if (referrerPath !== currentPath) {
              // Check if it's not a child route
              const isChildRoute = referrerPath.startsWith(`${currentPath}/`)
              if (!isChildRoute) {
                // Valid referrer exists, use router.back()
                router.back()
                return
              }
            }
          }
        } catch {
          // Invalid URL, continue to default
        }
      }
    } catch {
      // sessionStorage or other errors, continue to default
    }

    // No valid previous route (direct access), navigate to "/"
    router.push('/')
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

  const handleSearchItemClick = (item: SearchResultItem) => {
    // Send GA event with search details
    sendGAEvent('event', 'search_result_click', {
      search_query: query,
      result_title: item.titulo,
      result_description: item.descricao || '',
      result_type: item.tipo,
      event_timestamp: new Date().toISOString(),
    })

    // Navigate to the item
    if (item.category && item.id) {
      // Normalize category name to slug format
      const categorySlug = item.category
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Mn}/gu, '')
        .trim()
      router.push(
        `/servicos/categoria/${encodeURIComponent(categorySlug)}/${item.id}`
      )
    } else if (item.url) {
      window.open(item.url, '_blank')
    }
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
            <h2 className="text-base text-foreground font-medium">
              Resultados da Pesquisa
            </h2>
            {results && results.length > 0 ? (
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
                        <div className="text-card-foreground text-sm font-normal leading-5">
                          {item.titulo}
                        </div>
                        <div className="pt-1 line-clamp-2 text-muted-foreground text-xs font-normal leading-4">
                          {item.descricao}
                        </div>
                      </div>
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
    </div>
  )
}
