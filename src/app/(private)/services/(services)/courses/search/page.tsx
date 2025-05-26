'use client'
import CourseCardSearchPage from '@/app/(private)/components/course-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { Badge } from '@/components/ui/badge'
import { ServicesSearchInput } from '@/components/ui/custom/services-search-input'
import { COURSES } from '@/mocks/mock-courses'
import { useState } from 'react'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'IA', value: 'ai' },
  { label: 'Tecnologia', value: 'technology' },
  { label: 'Construção', value: 'construction' },
  { label: 'Meio Ambiente', value: 'environment' },
  { label: 'Educação', value: 'education' },
]

export default function ProfilePage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('all')

  const filtered = COURSES.filter(c => {
    const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = selected === 'all' ? true : c.type === selected
    return matchesQuery && matchesFilter
  })

  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Buscador" />
      <div>
        <section className="relative pt-10 px-5">
          <ServicesSearchInput
            placeholder="Pesquise um curso"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
        </section>

        <div className="relative px-5 pt-2 w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-3 min-w-max pt-3">
            {FILTERS.map(filter => (
              <Badge
                key={filter.value}
                onClick={() => setSelected(filter.value)}
                className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors
                    ${
                      selected === filter.value
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }
                  `}
                variant={selected === filter.value ? 'secondary' : 'outline'}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="px-5">
          <h2 className="text-md pt-4 font-semibold">Resultado</h2>
          <div className="pt-4">
            {filtered.length === 0 && (
              <div className="text-zinc-400 text-center py-10">
                Nenhum curso encontrado
              </div>
            )}
            {filtered.map(course => (
              <CourseCardSearchPage key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
