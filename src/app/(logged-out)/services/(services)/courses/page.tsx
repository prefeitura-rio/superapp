'use client'

import CoursesHeader from '@/app/components/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import { Badge } from '@/components/ui/badge'
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

export default function CoursePage() {
  const [selected, setSelected] = useState('all')

  const filteredCourses =
    selected === 'all'
      ? COURSES
      : COURSES.filter(course => course.type === selected)

  return (
    <div className="min-h-lvh">
      <CoursesHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="relative">
          <h2 className="px-4 text-4xl font-medium mb-2 bg-background z-10 pt-7 pb-3">
            Seu curso <br /> Começa aqui
          </h2>
          {/* Scrollable Filters */}
          <div className="relative w-full overflow-x-auto px-4 pb-4 no-scrollbar">
            <div className="flex gap-3 min-w-max">
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
        </section>
        <RecommendedCoursesCards courses={filteredCourses} />
        <RecentlyAddedCourses courses={filteredCourses} />
      </main>
    </div>
  )
}
