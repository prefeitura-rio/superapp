import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import { saveSearchToHistory as saveSearchToHistoryHelper } from '@/helpers/search-helpers'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export type CatalogSearchContext = 'servicos' | 'empregos' | 'cursos' | 'mei'

const CONTEXT_TO_TYPE: Record<CatalogSearchContext, string> = {
  servicos: 'service',
  empregos: 'job',
  cursos: 'course',
  mei: 'mei_opportunity',
}

const HISTORY_STORAGE_KEY = 'catalog-search-history'

interface UseCatalogSearchReturn {
  query: string
  primaryResults: ModelsSearchItem[]
  secondaryResults: ModelsSearchItem[]
  loading: boolean
  isSearching: boolean
  searchHistory: string[]
  setQuery: (query: string) => void
  onQueryChange: (newQuery: string) => void
  handleSearch: (searchQuery: string) => Promise<void>
  clearSearch: () => void
  removeFromHistory: (itemToRemove: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

async function fetchCatalogSearch(q: string): Promise<ModelsSearchItem[]> {
  const params = new URLSearchParams({ q })
  const response = await fetch(`/api/catalog-search?${params.toString()}`)
  if (!response.ok) return []
  const data = await response.json()
  return (data.items as ModelsSearchItem[]) || []
}

function splitResults(
  items: ModelsSearchItem[],
  context: CatalogSearchContext | null
): { primary: ModelsSearchItem[]; secondary: ModelsSearchItem[] } {
  if (!context) {
    return { primary: items, secondary: [] }
  }

  const contextType = CONTEXT_TO_TYPE[context]
  const primary = items.filter(item => item.type === contextType)
  const secondary = items.filter(item => item.type !== contextType)
  return { primary, secondary }
}

function updateSearchUrl(
  query: string,
  pathname: string,
  router: ReturnType<typeof useRouter>,
  isUpdatingUrlRef: React.MutableRefObject<boolean>
) {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)

  if (query && query.trim().length > 2) {
    params.set('q', query.trim())
  } else {
    params.delete('q')
  }

  const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

  isUpdatingUrlRef.current = true
  router.replace(newUrl, { scroll: false })
}

export function useCatalogSearch(
  context: CatalogSearchContext | null
): UseCatalogSearchReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [primaryResults, setPrimaryResults] = useState<ModelsSearchItem[]>([])
  const [secondaryResults, setSecondaryResults] = useState<ModelsSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)
  const isUpdatingUrl = useRef(false)
  const currentQueryRef = useRef('')

  useEffect(() => {
    currentQueryRef.current = query
  }, [query])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!saved) return
    try {
      setSearchHistory(JSON.parse(saved) as string[])
    } catch {
      // ignore
    }
  }, [])

  const performAndSetResults = useCallback(
    async (searchQuery: string) => {
      const items = await fetchCatalogSearch(searchQuery)
      const { primary, secondary } = splitResults(items, context)
      setPrimaryResults(primary)
      setSecondaryResults(secondary)
    },
    [context]
  )

  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false
      return
    }

    const urlQuery = searchParams.get('q') || ''

    if (isInitialMount.current) {
      if (urlQuery) {
        setQuery(urlQuery)
        if (urlQuery.trim().length > 2) {
          const doSearch = async () => {
            try {
              setLoading(true)
              await performAndSetResults(urlQuery)
              saveCatalogHistory(urlQuery)
            } catch (error) {
              console.error('Error in initial catalog search:', error)
            } finally {
              setLoading(false)
            }
          }
          doSearch()
        }
      }
      isInitialMount.current = false
    } else {
      if (urlQuery !== currentQueryRef.current) {
        setQuery(urlQuery)
        if (urlQuery.trim().length > 2) {
          const doSearch = async () => {
            try {
              setLoading(true)
              await performAndSetResults(urlQuery)
            } catch (error) {
              console.error('Error in URL catalog search:', error)
            } finally {
              setLoading(false)
            }
          }
          doSearch()
        } else {
          setPrimaryResults([])
          setSecondaryResults([])
        }
      }
    }
  }, [searchParams, performAndSetResults])

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      try {
        setLoading(true)
        await performAndSetResults(searchQuery)
        saveCatalogHistory(searchQuery)
        const saved = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]') as string[]
          : []
        setSearchHistory(saved)
        updateSearchUrl(searchQuery, pathname, router, isUpdatingUrl)
      } catch (error) {
        console.error('Error in catalog search:', error)
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    },
    [router, pathname, performAndSetResults]
  )

  const onQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery)

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }

      if (newQuery.length > 2) {
        setIsSearching(true)
        debounceTimeout.current = setTimeout(() => {
          handleSearch(newQuery)
        }, 500)
      } else {
        setPrimaryResults([])
        setSecondaryResults([])
        setIsSearching(false)
      }
    },
    [handleSearch]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setPrimaryResults([])
    setSecondaryResults([])
    updateSearchUrl('', pathname, router, isUpdatingUrl)
  }, [router, pathname])

  const removeFromHistory = useCallback((itemToRemove: string) => {
    if (typeof window === 'undefined') return
    const current = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]') as string[]
    const updated = current.filter(item => item !== itemToRemove)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
    setSearchHistory(updated)
  }, [])

  return {
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
  }
}

export function saveCatalogHistory(query: string) {
  if (typeof window === 'undefined' || !query.trim() || query.length <= 2) return
  const trimmed = query.trim()
  const current = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]') as string[]
  const filtered = current.filter(item => item !== trimmed)
  const updated = [trimmed, ...filtered].slice(0, 10)
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
  saveSearchToHistoryHelper(query)
}
