'use client'

import CoursesHeader from '@/app/components/courses/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import SearchPlaceholder from '@/app/components/search-placeholder'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { ModelsCurso } from '@/http-courses/models'
import Link from 'next/link'
import { RecentlyAddedCoursesSwipeSkeleton } from './recently-added-courses-skeleton'
import { RecentlyAddedCoursesSwipe } from './recently-added-courses-swipe'
import { RecommendedCoursesSwipe } from './recommended-courses-swipe'
import { RecommendedCoursesSwipeSkeleton } from './recommended-courses-swipe-skeleton'

const FILTERS = [
  { label: 'Tecnologia', value: 'tecnologia', icon: '💻' },
  { label: 'Construção', value: 'construcao', icon: '🏗️' },
  { label: 'Meio Ambiente', value: 'meio-ambiente', icon: '🌱' },
  { label: 'Educação', value: 'educacao', icon: '📚' },
  { label: 'Saúde', value: 'saude', icon: '🏥' },
]

export default function CoursePageClient({ courses }: { courses: ModelsCurso[] }) {
  return (
    <div className="min-h-lvh">
      <CoursesHeader />
      <main className="max-w-4xl mx-auto pt-15 pb-20 text-white">
        <div className="mt-4">
          <SearchPlaceholder isCourseSearch />
        </div>

        <section className="mt-4 pb-8">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex px-4 gap-4 w-max">
              {FILTERS.map(filter => (
                <Link
                  key={filter.value}
                  href={`/servicos/cursos/busca?categoria=${filter.value}`}
                  className="flex flex-col items-center cursor-pointer shrink"
                >
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card hover:bg-card/80">
                    <div className="flex items-center justify-center text-3xl mb-1">
                      {filter.icon}
                    </div>
                  </div>
                  <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground/90 text-center leading-tight font-medium">
                    {filter.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ResponsiveWrapper
          mobileComponent={<RecommendedCoursesCards courses={courses} />}
          desktopComponent={<RecommendedCoursesSwipe courses={courses} />}
          desktopSkeletonComponent={<RecommendedCoursesSwipeSkeleton />}
        />
        <ResponsiveWrapper
          mobileComponent={<RecentlyAddedCourses courses={courses} />}
          desktopComponent={<RecentlyAddedCoursesSwipe courses={courses} />}
          desktopSkeletonComponent={<RecentlyAddedCoursesSwipeSkeleton />}
        />
      </main>
    </div>
  )
}
