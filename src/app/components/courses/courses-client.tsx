'use client'

import CoursesHeader from '@/app/components/courses/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import SearchPlaceholder from '@/app/components/search-placeholder'
import { useState } from 'react'

const FILTERS = [
  { label: 'Saúde', value: 'health', icon: '💊' },
  { label: 'Nutrição', value: 'nutrition', icon: '🥗' },
  { label: 'Legislação', value: 'law', icon: '⚖️' },
  { label: 'Tecnologia', value: 'technology', icon: '💻' },
]

interface CoursePageClientProps {
  courses: any[]
}

export default function CoursePageClient({ courses }: CoursePageClientProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    setSelected(prev => (prev === value ? null : value))
  }

  const filteredCourses = !selected
    ? courses
    : courses.filter(course => course.type === selected)

  return (
    <div className="min-h-lvh">
      <CoursesHeader />
      <main className="max-w-4xl mx-auto pt-15 text-white">
        <div className="mt-10">
          <SearchPlaceholder isCourseSearch />
        </div>

        <section className="mt-8 px-4">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-full">
              {FILTERS.map(filter => (
                <div
                  key={filter.value}
                  onClick={() => handleSelect(filter.value)}
                  className="flex flex-col items-center cursor-pointer shrink"
                >
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2
                      ${
                        selected === filter.value
                          ? 'border-foreground/10 bg-card'
                          : 'border-card bg-card hover:bg-card/80'
                      }`}
                  >
                    <div className="flex items-center justify-center text-3xl mb-1">
                      {filter.icon}
                    </div>
                  </div>
                  <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground/90 text-center leading-tight font-medium">
                    {filter.label}
                  </span>
                </div>
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
