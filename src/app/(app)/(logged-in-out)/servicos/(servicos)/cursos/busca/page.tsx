'use client'

import {
  addVisitedCourse,
  getVisitedCourses,
  removeVisitedCourse,
} from '@/actions/courses/course-history'
import { createCourseSlug, isValidFilter } from '@/actions/courses/utils'
import { AccessibilityBadge } from '@/app/components/courses/badges'
import CoursesFilterDrawerContent from '@/app/components/drawer-contents/courses-filter-drawer-content'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { FilterIcon } from '@/assets/icons/filter-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SearchInput } from '@/components/ui/custom/search-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
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

// Types for API responses
interface SearchCoursesResult {
  courses: ModelsCurso[]
  pagination?: {
    limit: number
    page: number
    total: number
    total_pages: number
  }
}

interface SearchCoursesFilters {
  q?: string
  modalidade?: string
  local_curso?: string
  categoria?: string
  acessibilidade?: string
  page?: number
  limit?: number
}

// Helper function to search courses via route handler
async function searchCourses(
  filters: SearchCoursesFilters
): Promise<SearchCoursesResult> {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.modalidade) params.set('modalidade', filters.modalidade)
  if (filters.local_curso) params.set('local_curso', filters.local_curso)
  if (filters.categoria) params.set('categoria', filters.categoria)
  if (filters.acessibilidade)
    params.set('acessibilidade', filters.acessibilidade)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  const response = await fetch(`/api/courses/search?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to search courses')
  }
  return response.json()
}

// Helper function to get categories via route handler
async function getCourseCategories(): Promise<CategoryFilter[]> {
  const response = await fetch('/api/courses/categories')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
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
  const [initialCourses, setInitialCourses] = useState<Course[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)

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

  // Load initial courses when there's no search
  useEffect(() => {
    async function loadInitialCourses() {
      const sp = new URLSearchParams(searchParams.toString())
      const q = sp.get('q') || sp.get('query') || ''
      const modalidade = sp.get('modalidade') || ''
      const local_curso = sp.get('local_curso') || ''
      const categoria = sp.get('categoria') || ''
      const acessibilidade = sp.get('acessibilidade') || ''

      const hasFilters = Boolean(
        modalidade || local_curso || categoria || acessibilidade
      )
      const hasQuery = q.length >= 3

      // Only load initial courses if there's no search or filters
      if (!hasQuery && !hasFilters) {
        setIsLoadingInitial(true)
        try {
          const result = await searchCourses({
            limit: 4,
          })
          const transformedCourses: Course[] = result.courses.map(course => ({
            ...course,
            provider: course.organization || undefined,
            modality: course.modalidade || undefined,
          }))
          setInitialCourses(transformedCourses)
        } catch (error) {
          console.error('Error loading initial courses:', error)
          setInitialCourses([])
        } finally {
          setIsLoadingInitial(false)
        }
      } else {
        setInitialCourses([])
        setIsLoadingInitial(false)
      }
    }
    loadInitialCourses()
  }, [searchParams])

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
    // Only update parameters that are in the patch, preserve others
    for (const key of [
      'q',
      'modalidade',
      'local_curso',
      'categoria',
      'acessibilidade',
    ] as const) {
      if (key in patch) {
        const next = patch[key]
        if (next) {
          params.set(key, next)
        } else {
          params.delete(key)
        }
      }
      // If key is not in patch, keep existing value (don't delete)
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

    // Fazer busca se houver filtros ou query com mais de 2 caracteres
    const hasFilters = Object.values(applied).some(val =>
      Array.isArray(val) ? val.length > 0 : Boolean(val)
    )
    const shouldSearch = q.length >= 3 || hasFilters
    if (shouldSearch) {
      performSearch({ q, ...applied })
    } else if (q.length === 0 && !hasFilters) {
      // Only clear filtered courses when query is completely empty and no filters
      // This prevents flickering when typing 1-2 characters
      setFilteredCourses([])
    }
  }, [searchParams, performSearch])

  // Sincronizar draftFilters quando o drawer abre/fecha (sem disparar busca)
  useEffect(() => {
    if (isFilterOpen) {
      // Quando abre, copiar filtros aplicados para o draft
      setDraftFilters(selectedFilters)
    } else {
      // Quando fecha sem aplicar, resetar draft para os filtros aplicados
      setDraftFilters(selectedFilters)
    }
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
    } else if (newQuery.length === 0) {
      // Only update URL when clearing the search
      updateUrl({ q: '' })
    }
    // Don't update URL for 1-2 characters to prevent flickering
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

  const clearDraftFilters = () => {
    setDraftFilters({})
    setSelectedFilters({})
    updateUrl({
      modalidade: '',
      local_curso: '',
      categoria: '',
      acessibilidade: '',
    })
  }

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

  // Count active filters (only valid ones)
  const activeFiltersCount = useMemo(() => {
    return Object.entries(selectedFilters).filter(([key, value]) => {
      if (!value) return false

      // For categoria, check both COURSE_FILTERS and categoryFilters from API
      if (key === 'categoria') {
        const isValidInStatic = isValidFilter(key, value)
        const isValidInApi = categoryFilters.some(cat => cat.value === value)
        return isValidInStatic || isValidInApi
      }

      // For other filters, use isValidFilter
      return isValidFilter(key, value)
    }).length
  }, [selectedFilters, categoryFilters])

  const showResults = useMemo(() => {
    const hasFilters = activeFiltersCount > 0
    const hasQuery = (query?.trim().length ?? 0) >= 3
    return hasFilters || hasQuery
  }, [activeFiltersCount, query])

  // Detect if we're waiting for search to start (query changed but searchParams not updated yet)
  const isWaitingForSearch = useMemo(() => {
    const queryFromParams =
      searchParams.get('q') || searchParams.get('query') || ''
    const currentQuery = query?.trim() || ''
    // If current query has 3+ chars but doesn't match params, we're waiting
    return currentQuery.length >= 3 && currentQuery !== queryFromParams
  }, [query, searchParams])

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
            router.push('/servicos/cursos')
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
        <div className="px-4 pb-30 mt-6 space-y-6">
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
                    <div className="flex gap-3 items-center">
                      {course.cover_image && (
                        <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
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
                          {course.modalidade && ` ${course.modalidade}`}
                          {course.workload && ` • ${course.workload}`}
                        </p>
                        <AccessibilityBadge
                          accessibility={course.accessibility}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cursos iniciais - 4 cursos quando não há pesquisa */}
          {topCourses.length === 0 && (
            <div>
              {isLoadingInitial ? (
                <>
                  <h2 className="text-base font-medium text-foreground mb-4">
                    Cursos mais procurados
                  </h2>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-3 items-center">
                          <div className="w-28 h-28 shrink-0 rounded-lg bg-muted" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted/70 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : initialCourses.length > 0 ? (
                <>
                  <h2 className="text-base font-medium text-foreground mb-4">
                    Cursos mais procurados
                  </h2>
                  <div className="space-y-3">
                    {initialCourses.map(course => (
                      <Link
                        key={course.id}
                        href={`/servicos/cursos/${createCourseSlug(
                          course.id?.toString() || '',
                          course.title || ''
                        )}`}
                        onClick={() => handleCourseClick(course)}
                        className="block"
                      >
                        <div className="flex gap-3 items-center">
                          {course.cover_image && (
                            <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
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
                              {course.modalidade && `${course.modalidade}`}
                              {course.workload && ` • ${course.workload}`}
                            </p>
                            <AccessibilityBadge
                              accessibility={course.accessibility}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
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
                  <div
                    key={course.id}
                    className="flex gap-3 items-center group relative"
                  >
                    <Link
                      href={`/servicos/cursos/${createCourseSlug(
                        course.id.toString(),
                        course.title
                      )}`}
                      onClick={() => handleCourseClick(course as Course)}
                      className="flex gap-3 items-center flex-1 min-w-0"
                    >
                      {course.cover_image && (
                        <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
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
                          {course.modalidade && ` ${course.modalidade}`}
                          {course.workload && ` • ${course.workload}`}
                        </p>
                        <AccessibilityBadge
                          accessibility={(course as Course).accessibility}
                          className="mt-2"
                        />
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeVisitedCourse(course.id)
                        setVisitedCourses(getVisitedCourses())
                      }}
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Remover do histórico"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showResults && (
        <section className="px-4 mt-6">
          {isLoading || isWaitingForSearch ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3 items-center">
                    <div className="w-28 h-28 shrink-0 rounded-lg bg-muted" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted/70 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoading &&
            !isWaitingForSearch &&
            filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center text-center justify-center py-8">
              <ThemeAwareVideo
                source={VIDEO_SOURCES.emptyAddress}
                containerClassName="mb-6 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
              />
              <p className="text-lg text-muted-foreground">
                Ops... nenhum curso encontrado para a sua busca
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map(course => (
                <Link
                  key={course.id}
                  href={`/servicos/cursos/${createCourseSlug(
                    course.id?.toString() || '',
                    course.title || ''
                  )}`}
                  onClick={() => handleCourseClick(course)}
                  className="block"
                >
                  <div className="flex gap-3 items-center">
                    {course.cover_image && (
                      <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
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
                        {course.modalidade && `${course.modalidade}`}
                        {course.workload && ` • ${course.workload}`}
                      </p>
                      <AccessibilityBadge
                        accessibility={course.accessibility}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
