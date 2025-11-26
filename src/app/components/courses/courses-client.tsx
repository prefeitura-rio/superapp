'use client'

import CoursesHeader from '@/app/components/courses/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import type { UserInfo } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import SearchPlaceholder from '../search-placeholder'
import { MyCoursesHome } from './my-courses-home'
import { MyCoursesHomeSwipe } from './my-courses-home-swipe'
import { RecentlyAddedCoursesSwipeSkeleton } from './recently-added-courses-skeleton'
import { RecentlyAddedCoursesSwipe } from './recently-added-courses-swipe'
import { RecommendedCoursesSwipe } from './recommended-courses-swipe'
import { RecommendedCoursesSwipeSkeleton } from './recommended-courses-swipe-skeleton'

export default function CoursePageClient({
  courses,
  userInfo,
  myCourses,
  categoryFilters,
}: {
  courses: ModelsCurso[]
  userInfo: UserInfo
  myCourses: ModelsCurso[]
  categoryFilters: CategoryFilter[]
}) {
  if (courses.length === 0) {
    return (
      <div className="min-h-lvh">
        <CoursesHeader userInfo={userInfo} />
        <main className="max-w-4xl mx-auto pt-30 pb-20 text-white">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-muted-foreground text-center">
              Nenhum curso encontrado
            </p>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="min-h-lvh">
      <CoursesHeader userInfo={userInfo} />
      <main className="max-w-4xl mx-auto pt-18 pb-20 text-white">
        {categoryFilters.length > 0 && (
          <section className="mt-4 pb-8">
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="flex px-4 gap-4 w-max">
                {categoryFilters.map(filter => (
                  <Link
                    key={filter.value}
                    href={`/servicos/cursos/busca?categoria=${filter.value}`}
                    className="flex flex-col items-center cursor-pointer shrink"
                  >
                    <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card hover:bg-card/80">
                      {filter.imagePath && (
                        <div className="flex items-center justify-center w-12 h-12 relative">
                          <Image
                            src={filter.imagePath}
                            alt={filter.label}
                            width={48}
                            height={48}
                            className="object-contain"
                            onError={e => {
                              // Fallback: hide image if not found
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground/90 text-center leading-tight font-medium">
                      {filter.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {myCourses.length > 0 && (
          <ResponsiveWrapper
            mobileComponent={<MyCoursesHome courses={myCourses} />}
            desktopComponent={<MyCoursesHomeSwipe courses={myCourses} />}
            desktopSkeletonComponent={<RecommendedCoursesSwipeSkeleton />}
          />
        )}

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
