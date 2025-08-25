'use client'

import coursesApi from '@/actions/courses'
import { createCourseSlug } from '@/actions/courses/utils-mock'
import CoursesFilterDrawerContent from '@/app/components/drawer-contents/courses-filter-drawer-content'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { FilterIcon } from '@/assets/icons/filter-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SearchInput } from '@/components/ui/custom/search-input'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SEARCH_HISTORY_KEY = 'courses-search-history'
const MAX_HISTORY_ITEMS = 8

type Course = {
  id: string
  title: string
  description?: string
  requirements?: string[]
  spots?: number
  status?: string
  date?: string
  provider?: string
  workload?: string
  modality?: string
  type?: string
  certificate?: boolean
  period?: string
  imageUrl?: string
  [k: string]: any
}

import { FILTER_LABELS } from '@/actions/courses/utils-mock'

export default function CoursesSearchPage() {
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({})
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({})

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateUrl = (
    patch: Partial<
      Record<
        'q' | 'modalidade' | 'certificado' | 'categoria' | 'periodo',
        string
      >
    >,
    push = false
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of [
      'q',
      'modalidade',
      'certificado',
      'categoria',
      'periodo',
    ] as const) {
      const next = patch[key]
      if (typeof next === 'string') {
        if (next) params.set(key, next)
        else params.delete(key)
      }
    }
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    ;(push ? router.push : router.replace)(url, { scroll: false })
  }

  // Função para fazer busca na API
  const searchCourses = useCallback(
    async (filters: {
      q?: string
      modalidade?: string
      certificado?: string
      categoria?: string
      periodo?: string
    }) => {
      setIsLoading(true)
      try {
        const courses = await coursesApi.getCoursesWithFilters({
          query: filters.q,
          modalidade: filters.modalidade,
          certificado: filters.certificado,
          categoria: filters.categoria,
          periodo: filters.periodo,
        })
        setFilteredCourses(courses)
      } catch (error) {
        console.error('Erro ao buscar cursos:', error)
        setFilteredCourses([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

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

  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString())
    const q = sp.get('q') || sp.get('query') || ''
    const modalidade = sp.get('modalidade') || ''
    const certificado = sp.get('certificado') || ''
    const categoria = sp.get('categoria') || sp.get('category') || ''
    const periodo = sp.get('periodo') || ''

    setQuery(q)
    const applied = { modalidade, certificado, categoria, periodo }
    setSelectedFilters(applied)

    if (!isFilterOpen) setDraftFilters(applied)

    // Fazer busca se houver filtros ou query com mais de 2 caracteres
    const shouldSearch = q.length >= 3 || Object.values(applied).some(Boolean)
    if (shouldSearch) {
      searchCourses({ q, ...applied })
    } else {
      setFilteredCourses([])
    }
  }, [searchParams, searchCourses, isFilterOpen])

  useEffect(() => {
    if (isFilterOpen) setDraftFilters(selectedFilters)
  }, [isFilterOpen, selectedFilters])

  // -------- Histórico --------
  const saveSearchToHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length <= 2) return
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
      const next = prev.filter(q => q !== item)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }

  // -------- Busca & Filtros (APLICADOS) --------
  const handleSearch = (text: string) => {
    setQuery(text)
    saveSearchToHistory(text)
    updateUrl({ q: text }, true)
  }

  const onQueryChange = (newQuery: string) => {
    setQuery(newQuery)

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    if (newQuery.length >= 3) {
      debounceTimeout.current = setTimeout(() => {
        saveSearchToHistory(newQuery)
        updateUrl({ q: newQuery }, true)
      }, 500)
    } else {
      updateUrl({ q: newQuery })
    }
  }

  const clearSearch = () => {
    setQuery('')
    updateUrl({ q: '' })
  }

  const handleDraftFilterSelect = (category: string, value: string) => {
    setDraftFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }))
  }

  const clearDraftFilters = () => setDraftFilters({})

  const applyFilters = () => {
    setSelectedFilters(draftFilters)
    updateUrl({
      modalidade: draftFilters.modalidade || '',
      certificado: draftFilters.certificado || '',
      categoria: draftFilters.categoria || '',
      periodo: draftFilters.periodo || '',
    })
    setIsFilterOpen(false)
  }

  // Função para remover um filtro específico
  const removeFilter = (filterKey: string) => {
    const newFilters = { ...selectedFilters, [filterKey]: '' }
    setSelectedFilters(newFilters)
    setDraftFilters(newFilters)
    updateUrl({
      modalidade:
        filterKey === 'modalidade' ? '' : selectedFilters.modalidade || '',
      certificado:
        filterKey === 'certificado' ? '' : selectedFilters.certificado || '',
      categoria:
        filterKey === 'categoria' ? '' : selectedFilters.categoria || '',
      periodo: filterKey === 'periodo' ? '' : selectedFilters.periodo || '',
    })
  }

  const hasAnyAppliedFilter = useMemo(
    () => Object.values(selectedFilters).some(Boolean),
    [selectedFilters]
  )

  // Gera os badges de filtros ativos
  const activeFilterBadges = useMemo(() => {
    const badges = []

    for (const [key, value] of Object.entries(selectedFilters)) {
      if (value) {
        const label = FILTER_LABELS[key]?.[value] || value
        badges.push({
          key,
          value,
          label,
        })
      }
    }

    return badges
  }, [selectedFilters])

  const showResults = hasAnyAppliedFilter || (query?.trim().length ?? 0) >= 3

  return (
    <main className="min-h-lvh max-w-4xl mx-auto text-foreground">
      <section className="relative pt-5 px-4 flex items-center gap-4">
        <SearchInput
          ref={searchInputRef}
          placeholder="Pesquise um curso"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onClear={clearSearch}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
              }
              saveSearchToHistory(query)
              updateUrl({ q: query }, true)
            }
          }}
          onBack={() => {
            router.back()
          }}
          className="flex-1 min-w-0"
        />
        <CustomButton
          className="bg-card w-14 h-14 p-4 rounded-full flex items-center justify-center hover:bg-card/80 transition-colors shrink-0"
          onClick={() => setIsFilterOpen(true)}
          aria-label="Abrir filtros"
        >
          <FilterIcon />
        </CustomButton>
      </section>

      {/* Badges de filtros ativos */}
      {activeFilterBadges.length > 0 && (
        <section className="px-4 mt-4 pl-10">
          <div className="flex flex-wrap gap-2">
            {activeFilterBadges.map(({ key, label }) => (
              <div
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-card text-muted-foreground rounded-full text-sm font-normal"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remover filtro ${label}`}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!showResults && (
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
                      aria-label={`Remover ${text} do histórico`}
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

      {showResults && (
        <section className="px-4 mt-6">
          <div className="text-sm text-muted-foreground mb-2">
            {isLoading ? (
              'Buscando...'
            ) : (
              <>
                {filteredCourses.length} resultado
                {filteredCourses.length === 1 ? '' : 's'}
              </>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted/70 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum curso encontrado com os critérios aplicados.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredCourses.map(course => (
                <li key={course.id} className="py-2">
                  <Link
                    href={`/servicos/cursos/${createCourseSlug(course.id, course.title)}`}
                    className="block rounded-md -mx-2 px-2 py-2 hover:bg-muted/40 focus:outline-none focus:ring-primary"
                  >
                    <h3 className="text-base font-medium truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {course.provider ?? '—'}
                      {' • '}
                      {course.modality ?? '—'}
                      {course.period ? ` • ${course.period}` : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <CoursesFilterDrawerContent
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        selectedFilters={draftFilters}
        onFilterSelect={handleDraftFilterSelect}
        onClearFilters={clearDraftFilters}
        onApplyFilters={applyFilters}
      />
    </main>
  )
}
