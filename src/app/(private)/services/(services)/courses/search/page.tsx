'use client'
import CourseCardSearchPage from '@/app/(private)/components/course-card-search-page'
import { ServicesHeader } from '@/app/(private)/components/services-header'
import { ServicesSearchInput } from '@/components/ui/custom/services-search-input'
import { COURSES } from '@/mocks/mock-courses'
import { useState } from 'react'

export default function ProfilePage() {
  const [query, setQuery] = useState('')
  const filtered = COURSES.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <main className="max-w-md mx-auto pt-15 text-white">
      <div className="min-h-lvh">
        <ServicesHeader title="Buscador" />
        <section className="relative pt-10 mx-5">
          <ServicesSearchInput
            placeholder="Pesquise um curso"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
          <h2 className="text-md pt-7 font-semibold">Resultado</h2>
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
        </section>
      </div>
    </main>
  )
}
