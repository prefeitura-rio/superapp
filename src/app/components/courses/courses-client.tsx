'use client'

import CoursesHeader from '@/app/components/courses/courses-header'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/components/recommended-courses-cards'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import type { UserInfo } from '@/lib/user-info'
import { CategoryFiltersMobile } from './category-filters-mobile'
import { CategoryFiltersSwipe } from './category-filters-swipe'
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
      <main className="max-w-4xl mx-auto pt-24 pb-34 text-white">
        {categoryFilters.length > 0 && (
          <ResponsiveWrapper
            mobileComponent={
              <CategoryFiltersMobile categoryFilters={categoryFilters} />
            }
            desktopComponent={
              <CategoryFiltersSwipe categoryFilters={categoryFilters} />
            }
          />
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
