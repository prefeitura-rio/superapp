'use client'

import { categoriaToTypeOrSynonym } from '@/app/(app)/(logged-in-out)/services/(services)/courses/search/page'
import CoursesHeader from '@/app/components/courses/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import SearchPlaceholder from '@/app/components/search-placeholder'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import Link from 'next/link'
import { RecommendedCoursesSwipeSkeleton } from '../recommended-courses-swipe-skeleton'
import { RecentlyAddedCoursesSwipeSkeleton } from './recently-added-courses-skeleton'
import { RecentlyAddedCoursesSwipe } from './recently-added-courses-swipe'
import { RecommendedCoursesSwipe } from './recommended-courses-swipe'

const FILTERS = [
  { label: 'Dados', value: 'data', icon: '📊' },
  { label: 'Nutrição', value: 'nutrition', icon: '🥗' },
  { label: 'Alimentação', value: 'food', icon: '🍎' },
  { label: 'Saúde', value: 'health', icon: '💊' },
  { label: 'Animal', value: 'animal', icon: '🐾' },
  { label: 'Carreira', value: 'career', icon: '💼' },
]

interface CoursePageClientProps {
  courses: any[]
}

export default function CoursePageClient({ courses }: CoursePageClientProps) {
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
                <Link
                  key={filter.value}
                  href={`/services/courses/search?categoria=${categoriaToTypeOrSynonym[filter.value]}`}
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
