'use client'

import { SearchResultSkeleton } from '@/app/components/search-result-skeleton'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import { useRecaptcha } from '@/providers/recaptcha-provider'
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

interface SearchWithRecaptchaProps {
  isLoggedIn: boolean
}

export default function SearchWithRecaptcha({
  isLoggedIn,
}: SearchWithRecaptchaProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { recaptchaToken, setRecaptchaToken, isVerified } = useRecaptcha()

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

  // Check if reCAPTCHA is needed for search
  useEffect(() => {
    // If user is logged in, no reCAPTCHA needed
    if (isLoggedIn) {
      return
    }

    // If reCAPTCHA is not configured, no verification needed
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      return
    }

    // If already verified, no need to show reCAPTCHA
    if (isVerified) {
      return
    }

    // For non-authenticated users, show reCAPTCHA challenge
    setShowRecaptcha(true)
  }, [isLoggedIn, isVerified])

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

      // Prepare headers
      const headers: HeadersInit = {}

      // Add reCAPTCHA token if available
      if (recaptchaToken) {
        headers['X-Recaptcha-Token'] = recaptchaToken
      }

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
        {
          headers,
        }
      )

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

  const handleRecaptchaToken = async (token: string) => {
    console.log('reCAPTCHA verification successful for search...')
    setRecaptchaToken(token)
    setShowRecaptcha(false)
  }

  const handleRecaptchaError = (error: string) => {
    console.error('reCAPTCHA error:', error)
    setRecaptchaError(error)
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-4">
          <h4 className="text-lg font-medium mb-2">Verificação de Segurança</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Complete a verificação abaixo para acessar a pesquisa
          </p>
        </div>

        {/* reCAPTCHA Component */}
        <RecaptchaEnterprise
          siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          action="search"
          onTokenReceived={handleRecaptchaToken}
          onError={handleRecaptchaError}
        />

        {recaptchaError && (
          <div className="mt-4 text-sm text-destructive text-center">
            Erro na verificação: {recaptchaError}
          </div>
        )}
      </div>
    )
  }

  // Show the actual search interface
  return (
    <div className="min-h-lvh max-w-4xl px-4 mx-auto pt-5 flex flex-col pb-4">
      <SearchInput
        ref={searchInputRef}
        placeholder="Do que você precisa?"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onBack={() => router.back()}
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
                      onClick={() => {
                        if (item.category && item.id && item.collection) {
                          router.push(
                            `/services/category/${encodeURIComponent(item.category)}/${item.id}/${item.collection}`
                          )
                        } else if (item.url) {
                          window.open(item.url, '_blank')
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (item.category && item.id && item.collection) {
                            router.push(
                              `/services/category/${encodeURIComponent(item.category)}/${item.id}/${item.collection}`
                            )
                          } else if (item.url) {
                            window.open(item.url, '_blank')
                          }
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
