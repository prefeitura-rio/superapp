'use client'

import {
  addVisitedCourse,
  getVisitedCourses,
} from '@/actions/courses/course-history'
import { getCourseCategories } from '@/actions/courses/get-categories'
import { searchCourses } from '@/actions/courses/search-courses'
import { createCourseSlug } from '@/actions/courses/utils-mock'
import CoursesFilterDrawerContent from '@/app/components/drawer-contents/courses-filter-drawer-content'
import { ChevronRightIcon } from '@/assets/icons'
import { FilterIcon } from '@/assets/icons/filter-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SearchInput } from '@/components/ui/custom/search-input'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SEARCH_HISTORY_KEY = 'courses-search-history'
const MAX_HISTORY_ITEMS = 8

// Use ModelsCurso from API, but extend it for UI purposes
type Course = ModelsCurso & {
  // Additional fields that might be needed for display
  provider?: string
  modality?: string
  period?: string
}

export default function CoursesSearchPage() {
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([])
  const [visitedCourses, setVisitedCourses] = useState<
    ReturnType<typeof getVisitedCourses>
  >([])

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({})
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({})

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const filters = await getCourseCategories()
        setCategoryFilters(filters)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load visited courses on mount
  useEffect(() => {
    setVisitedCourses(getVisitedCourses())
  }, [])

  const updateUrl = (
    patch: Partial<
      Record<
        'q' | 'modalidade' | 'local_curso' | 'categoria' | 'acessibilidade',
        string
      >
    >,
    push = false
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of [
      'q',
      'modalidade',
      'local_curso',
      'categoria',
      'acessibilidade',
    ] as const) {
      const next = patch[key]
      if (next) {
        params.set(key, next)
      } else {
        params.delete(key)
      }
    }
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    ;(push ? router.push : router.replace)(url, { scroll: false })
  }

  // Função para fazer busca na API
  const performSearch = useCallback(
    async (filters: {
      q?: string
      modalidade?: string
      local_curso?: string
      categoria?: string
      acessibilidade?: string
    }) => {
      setIsLoading(true)
      try {
        const result = await searchCourses({
          q: filters.q,
          modalidade: filters.modalidade,
          local_curso: filters.local_curso,
          categoria: filters.categoria,
          acessibilidade: filters.acessibilidade,
        })
        // Transform API courses to UI format
        const transformedCourses: Course[] = result.courses.map(course => ({
          ...course,
          provider: course.organization || undefined,
          modality: course.modalidade || undefined,
        }))
        setFilteredCourses(transformedCourses)
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
    const local_curso = sp.get('local_curso') || ''
    const categoria = sp.get('categoria') || ''
    const acessibilidade = sp.get('acessibilidade') || ''

    setQuery(q)

    const applied = {
      modalidade,
      local_curso,
      categoria,
      acessibilidade,
    }
    setSelectedFilters(applied)

    if (!isFilterOpen) setDraftFilters(applied)

    // Fazer busca se houver filtros ou query com mais de 2 caracteres
    const hasFilters = Object.values(applied).some(val =>
      Array.isArray(val) ? val.length > 0 : Boolean(val)
    )
    const shouldSearch = q.length >= 3 || hasFilters
    if (shouldSearch) {
      performSearch({ q, ...applied })
    } else {
      setFilteredCourses([])
    }
  }, [searchParams, performSearch, isFilterOpen])

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
    setDraftFilters(prev => {
      const current = prev[category]
      // If clicking the same value, deselect it
      if (current === value) {
        const { [category]: _, ...rest } = prev
        return rest
      }
      // Otherwise, select the new value (replacing any previous selection)
      return {
        ...prev,
        [category]: value,
      }
    })
  }

  const clearDraftFilters = () => setDraftFilters({})

  const applyFilters = () => {
    setSelectedFilters(draftFilters)
    updateUrl({
      modalidade: draftFilters.modalidade || '',
      local_curso: draftFilters.local_curso || '',
      categoria: draftFilters.categoria || '',
      acessibilidade: draftFilters.acessibilidade || '',
    })
    setIsFilterOpen(false)
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(selectedFilters).filter(Boolean).length
  }, [selectedFilters])

  const showResults = useMemo(() => {
    const hasFilters = activeFiltersCount > 0
    const hasQuery = (query?.trim().length ?? 0) >= 3
    return hasFilters || hasQuery
  }, [activeFiltersCount, query])

  // Top 5 courses for "Mais pesquisados" - only show if we have search results
  const topCourses = useMemo(() => {
    // Only show top courses if we have a search query or filters applied
    const hasSearch = (query?.trim().length ?? 0) >= 3 || activeFiltersCount > 0
    return hasSearch ? filteredCourses.slice(0, 5) : []
  }, [filteredCourses, query, activeFiltersCount])

  // Handle course click to add to visited history
  const handleCourseClick = (course: Course) => {
    if (course.id && course.title) {
      addVisitedCourse({
        id: course.id,
        title: course.title,
        cover_image: course.cover_image,
        organization: course.organization,
        modalidade: course.modalidade,
        workload: course.workload,
      })
      // Refresh visited courses
      setVisitedCourses(getVisitedCourses())
    }
  }

  return (
    <main className="min-h-lvh max-w-4xl mx-auto text-foreground">
      <section className="relative pt-5 px-4 flex items-center gap-4">
        <SearchInput
          ref={searchInputRef}
          placeholder="Encontre seu curso"
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
        <div className="relative shrink-0">
          <CustomButton
            className="bg-card w-14 h-14 p-4 rounded-full flex items-center justify-center hover:bg-card/80 transition-colors"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Abrir filtros"
          >
            <FilterIcon />
          </CustomButton>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </section>

      {!showResults && (
        <div className="px-4 mt-6 space-y-6">
          {/* Mais pesquisados - Top 5 cursos empilhados */}
          {topCourses.length > 0 && (
            <div>
              <h2 className="text-base font-medium text-foreground mb-4">
                Mais pesquisados
              </h2>
              <div className="relative">
                {topCourses.map((course, index) => (
                  <Link
                    key={course.id}
                    href={`/servicos/cursos/${createCourseSlug(
                      course.id?.toString() || '',
                      course.title || ''
                    )}`}
                    onClick={() => handleCourseClick(course)}
                    className="block mb-3 last:mb-0"
                  >
                    <div className="flex gap-3 bg-card rounded-xl p-3 hover:bg-card/80 transition-colors">
                      {course.cover_image && (
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={course.cover_image}
                            alt={course.title || 'Curso'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {course.title || 'Curso sem título'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.organization || '—'}
                          {course.modalidade && ` • ${course.modalidade}`}
                          {course.workload && ` • ${course.workload}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pesquisados por você - 10 cursos visitados */}
          {visitedCourses.length > 0 && (
            <div>
              <h2 className="text-base font-medium text-foreground mb-4">
                Pesquisados por você
              </h2>
              <div className="space-y-3">
                {visitedCourses.slice(0, 10).map(course => (
                  <Link
                    key={course.id}
                    href={`/servicos/cursos/${createCourseSlug(
                      course.id.toString(),
                      course.title
                    )}`}
                    onClick={() => handleCourseClick(course as Course)}
                    className="block"
                  >
                    <div className="flex gap-3 bg-card rounded-xl p-3 hover:bg-card/80 transition-colors">
                      {course.cover_image && (
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={course.cover_image}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.organization || '—'}
                          {course.modalidade && ` • ${course.modalidade}`}
                          {course.workload && ` • ${course.workload}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Fallback: Most searched queries if no courses */}
          {topCourses.length === 0 && visitedCourses.length === 0 && (
            <>
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
                        <span
                          className="flex-1"
                          onClick={() => handleSearch(text)}
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
                          aria-label={`Remover ${text} do histórico`}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
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
                    href={`/servicos/cursos/${createCourseSlug(
                      course.id?.toString() || '',
                      course.title || ''
                    )}`}
                    onClick={() => handleCourseClick(course)}
                    className="block rounded-md -mx-2 px-2 py-2 hover:bg-muted/40 focus:outline-none focus:ring-primary"
                  >
                    <h3 className="text-base font-medium truncate">
                      {course.title || 'Curso sem título'}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {course.provider || course.organization || '—'}
                      {' • '}
                      {course.modality || '—'}
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
        categoryFilters={categoryFilters}
      />
    </main>
  )
}
