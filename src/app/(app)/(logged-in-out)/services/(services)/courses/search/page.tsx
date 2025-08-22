'use client'

import CoursesFilterDrawerContent from '@/app/components/drawer-contents/courses-filter-drawer-content'
import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { FilterIcon } from '@/assets/icons/filter-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SearchInput } from '@/components/ui/custom/search-input'
import { COURSES as ALL_COURSES } from '@/mocks/mock-courses'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createCourseSlug } from '../../../../../../../lib/utils'

const SEARCH_HISTORY_KEY = 'courses-search-history'
const MAX_HISTORY_ITEMS = 8

type Course = {
  id: number | string
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

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const periodPtToEn: Record<string, string> = {
  manha: 'morning',
  tarde: 'afternoon',
  noite: 'night',
}
const periodEnToPt: Record<string, string> = {
  morning: 'manhã',
  afternoon: 'tarde',
  night: 'noite',
}

export const categoriaToTypeOrSynonym: Record<string, string> = {
  tecnologia: 'technology',
  technology: 'technology',
  tech: 'technology',
  informatica: 'technology',
  ia: 'technology',
  construcao: 'construction',
  marcenaria: 'construction',
  construction: 'construction',
  obra: 'construction',
  ambiente: 'environment',
  'meio ambiente': 'environment',
  meioambiente: 'environment',
  ambiental: 'environment',
  environment: 'environment',
  carreira: 'career',
  career: 'career',
  dados: 'technology',
  data: 'technology',
}

export default function CoursesSearchPage() {
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({})
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({})

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
    ;(
      ['q', 'modalidade', 'certificado', 'categoria', 'periodo'] as const
    ).forEach(key => {
      const next = patch[key]
      if (typeof next === 'string') {
        if (next) params.set(key, next)
        else params.delete(key)
      }
    })
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    ;(push ? router.push : router.replace)(url, { scroll: false })
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (isFilterOpen) setDraftFilters(selectedFilters)
  }, [isFilterOpen]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const hasAnyAppliedFilter = useMemo(
    () => Object.values(selectedFilters).some(Boolean),
    [selectedFilters]
  )

  const filteredCourses: Course[] = useMemo(() => {
    const q = normalize(query || '')
    const wantsText = q.length >= 3

    const categoriaRaw = selectedFilters.categoria?.trim() || ''
    const categoriaNorm = normalize(categoriaRaw)
    const mappedType = categoriaToTypeOrSynonym[categoriaNorm]

    const modalidade = selectedFilters.modalidade?.trim() || ''
    const certificado = selectedFilters.certificado?.trim() || ''
    const periodoRaw = selectedFilters.periodo?.trim() || ''
    const periodoEn = periodPtToEn[normalize(periodoRaw)] || ''

    return (ALL_COURSES as Course[]).filter(course => {
      if (wantsText) {
        const txt = `${course.title ?? ''} ${course.description ?? ''}`
        if (!normalize(txt).includes(q)) return false
      }
      if (modalidade) {
        if (normalize(course.modality ?? '') !== normalize(modalidade))
          return false
      }
      if (certificado) {
        const want = certificado === 'sim'
        if (Boolean(course.certificate) !== want) return false
      }
      if (periodoEn) {
        if (normalize(course.period ?? '') !== normalize(periodoEn))
          return false
      }
      if (categoriaNorm && categoriaNorm !== 'todos') {
        if (mappedType && course.type) {
          if (normalize(course.type) !== normalize(mappedType)) return false
        } else {
          const hay = `${course.title ?? ''} ${course.description ?? ''}`
          if (!normalize(hay).includes(categoriaNorm)) return false
        }
      }
      return true
    })
  }, [ALL_COURSES, query, selectedFilters])

  return (
    <main className="min-h-lvh max-w-4xl mx-auto text-foreground">
      <section className="relative pt-10 px-4 flex items-center gap-4">
        <SearchInput
          ref={searchInputRef}
          placeholder="Pesquise um curso"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onClear={clearSearch}
          onKeyDown={e => {
            if (e.key === 'Enter') {
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

      {!hasAnyAppliedFilter && (query?.length ?? 0) <= 2 && (
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

      {(hasAnyAppliedFilter || (query?.trim().length ?? 0) >= 3) && (
        <section className="px-4 mt-6">
          <div className="text-sm text-muted-foreground mb-2">
            {filteredCourses.length} resultado
            {filteredCourses.length === 1 ? '' : 's'}
          </div>

          {filteredCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum curso encontrado com os critérios aplicados.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredCourses.map(course => (
                <li key={course.id} className="py-2">
                  <Link
                    href={`/services/courses/${createCourseSlug(course.id, course.title)}`}
                    className="block rounded-md -mx-2 px-2 py-2 hover:bg-muted/40 focus:outline-none focus:ring-primary"
                  >
                    <h3 className="text-base font-medium truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {course.provider ?? '—'}
                      {' • '}
                      {course.modality ?? '—'}
                      {course.period
                        ? ` • ${periodEnToPt[course.period] ?? course.period}`
                        : ''}
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
