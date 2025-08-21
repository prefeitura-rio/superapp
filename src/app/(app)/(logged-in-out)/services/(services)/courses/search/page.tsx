'use client'

import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { SearchInput } from '@/components/ui/custom/search-input'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const SEARCH_HISTORY_KEY = 'courses-search-history'
const MAX_HISTORY_ITEMS = 8

export default function CoursesSearchPage() {
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch {
        localStorage.removeItem(SEARCH_HISTORY_KEY)
      }
    }
  }, [])

  const saveSearchToHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length <= 2) return
    const trimmed = searchQuery.trim()

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed)
      const newHistory = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const removeFromHistory = (item: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(q => q !== item)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const handleSearch = (text: string) => {
    setQuery(text)
    saveSearchToHistory(text)
  }

  const clearSearch = () => {
    setQuery('')
  }

  return (
    <main className="min-h-lvh max-w-4xl mx-auto text-white">
      <section className="relative pt-10 px-4">
        <SearchInput
          ref={searchInputRef}
          placeholder="Pesquise um curso"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onClear={clearSearch}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              saveSearchToHistory(query)
            }
          }}
          onBack={() => {
            router.back()
          }}
        />
      </section>

      {query.length <= 2 && (
        <div className="px-4 mt-6 space-y-6">
          <div>
            <h2 className="text-base font-medium text-foreground">
              Mais pesquisados
            </h2>
            <ul>
              {[
                'Curso de IA',
                'Excel Essencial',
                'Meio Ambiente',
                'Educação básica',
              ].map((text, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer"
                  onClick={() => handleSearch(text)}
                >
                  <span>{text}</span>
                  <ChevronRightIcon className="text-primary h-6 w-6" />
                </li>
              ))}
            </ul>
          </div>

          {searchHistory.length > 0 && (
            <div>
              <h2 className="text-base font-medium text-foreground">
                Pesquisados por você
              </h2>
              <ul>
                {searchHistory.map((text, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex justify-between items-center py-4 border-b border-border cursor-pointer group"
                  >
                    <span className="flex-1" onClick={() => handleSearch(text)}>
                      {text}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        removeFromHistory(text)
                      }}
                      className="text-primary h-5 w-5 hover:text-destructive transition-colors"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
