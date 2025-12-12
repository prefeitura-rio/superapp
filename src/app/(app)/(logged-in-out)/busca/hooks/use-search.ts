import type { SearchResultItem } from '@/helpers/search-helpers'
import {
  loadSearchHistory,
  performSearch,
  removeFromHistory as removeFromHistoryHelper,
  saveSearchToHistory as saveSearchToHistoryHelper,
} from '@/helpers/search-helpers'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSearchReturn {
  query: string
  results: SearchResultItem[]
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

/**
 * Updates the URL with the search query parameter
 */
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

  const newUrl = params.toString()
    ? `${pathname}?${params.toString()}`
    : pathname

  isUpdatingUrlRef.current = true
  router.replace(newUrl, { scroll: false })
}

export function useSearch(): UseSearchReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)
  const isUpdatingUrl = useRef(false)
  const currentQueryRef = useRef('')

  // Keep ref in sync with query state
  useEffect(() => {
    currentQueryRef.current = query
  }, [query])

  // Load search history from localStorage on mount
  useEffect(() => {
    const history = loadSearchHistory()
    setSearchHistory(history)
  }, [])

  // Load query from URL on mount and when URL changes (browser back/forward)
  useEffect(() => {
    // Skip if we're currently updating the URL ourselves
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false
      return
    }

    const urlQuery = searchParams.get('q') || ''

    if (isInitialMount.current) {
      // On initial mount, load query from URL if present
      if (urlQuery) {
        setQuery(urlQuery)
        // Perform search if query is valid
        if (urlQuery.trim().length > 2) {
          // Use a separate async function to avoid dependency issues
          const performInitialSearch = async () => {
            try {
              setLoading(true)
              const mergedResults = await performSearch(urlQuery)
              setResults(mergedResults)
              const updatedHistory = saveSearchToHistoryHelper(urlQuery)
              setSearchHistory(updatedHistory)
            } catch (error) {
              console.error('Error in initial search:', error)
              const hardcodedResults = await performSearch(urlQuery)
              setResults(hardcodedResults)
            } finally {
              setLoading(false)
            }
          }
          performInitialSearch()
        }
      }
      isInitialMount.current = false
    } else {
      // On subsequent URL changes (e.g., browser back/forward), sync query state
      if (urlQuery !== currentQueryRef.current) {
        setQuery(urlQuery)
        if (urlQuery.trim().length > 2) {
          // Use a separate async function to avoid dependency issues
          const performUrlSearch = async () => {
            try {
              setLoading(true)
              const mergedResults = await performSearch(urlQuery)
              setResults(mergedResults)
            } catch (error) {
              console.error('Error in URL search:', error)
              const hardcodedResults = await performSearch(urlQuery)
              setResults(hardcodedResults)
            } finally {
              setLoading(false)
            }
          }
          performUrlSearch()
        } else {
          setResults([])
        }
      }
    }
  }, [searchParams])

  // Auto-focus the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      try {
        setLoading(true)

        const mergedResults = await performSearch(searchQuery)
        setResults(mergedResults)

        // Save to search history after successful search
        const updatedHistory = saveSearchToHistoryHelper(searchQuery)
        setSearchHistory(updatedHistory)

        // Update URL with search query
        updateSearchUrl(searchQuery, pathname, router, isUpdatingUrl)
      } catch (error) {
        console.error('Error in search:', error)
        // Still try to show hardcoded results even on error
        const hardcodedResults = await performSearch(searchQuery)
        setResults(hardcodedResults)
        // Update URL even on error
        updateSearchUrl(searchQuery, pathname, router, isUpdatingUrl)
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    },
    [router, pathname]
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
        }, 500) // 500ms delay
      } else {
        setResults([])
        setIsSearching(false)
      }
    },
    [handleSearch]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    // Clear query param from URL
    updateSearchUrl('', pathname, router, isUpdatingUrl)
  }, [router, pathname])

  const removeFromHistory = useCallback((itemToRemove: string) => {
    const updatedHistory = removeFromHistoryHelper(itemToRemove)
    setSearchHistory(updatedHistory)
  }, [])

  return {
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
  }
}
