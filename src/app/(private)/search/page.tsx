'use client'

import { SearchInput } from '@/components/ui/custom/search-input'
import { ArrowRight, ArrowRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { CategoryGrid } from '../components/category-grid'
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

export default function Search() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const suggestions = [
    'Quero pagar meu IPTU',
    'Matricular meu filho na escola',
    'Procurar emprego',
    'Cadastrar evento',
  ]

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
      <div className="max-w-md px-5 mx-auto pt-5 flex flex-col space-y-6 pb-4">
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
              <h2 className="text-lg font-semibold">Resultados da Pesquisa</h2>
              <SearchResultSkeleton />
            </div>
          ) : query.length > 2 ? (
            <div>
              <h2 className="text-lg font-semibold">Resultados da Pesquisa</h2>
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
                          <div className="text-white mb-1">{item.titulo}</div>
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
                <div className="text-gray-500 text-center mt-4">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold">Sugestões</h2>
              <ul>
                {suggestions.map((text, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-300 flex justify-between items-center py-4 border-b border-neutral-800 cursor-pointer"
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
                    <ArrowRight className="text-white h-5 w-5" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Hide CategoryGrid when searching */}
      {query.length <= 2 && (
        <div className="max-w-md mx-auto">
          <CategoryGrid title="Categorias" categories={categories} />
        </div>
      )}
    </>
  )
}
