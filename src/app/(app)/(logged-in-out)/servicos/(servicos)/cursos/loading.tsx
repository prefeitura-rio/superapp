import { CategoryFiltersMobileSkeleton } from '@/app/components/courses/category-filters-mobile-skeleton'
import { CategoryFiltersSwipeSkeleton } from '@/app/components/courses/category-filters-swipe-skeleton'
import CoursesHeader from '@/app/components/courses/courses-header'
import {
  CourseCardSkeleton,
  RecentlyAddedCoursesSwipeSkeleton,
} from '@/app/components/courses/recently-added-courses-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserInfoFromToken } from '@/lib/user-info'

function MyCoursesHomeSkeleton() {
  return (
    <>
      <div className="pb-2 px-4 md:px-1">
        <Skeleton className="h-5 w-32" />
      </div>
      {/* Mobile (below 896px) */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[895px]:block min-[896px]:hidden">
        <div className="flex gap-2 px-4 min-w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
      {/* Desktop (896px+) */}
      <div className="hidden min-[896px]:block px-1 pb-6">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}

function AllCoursesSkeleton() {
  return (
    <>
      <div className="pb-2 px-4 md:px-1">
        <Skeleton className="h-5 w-32" />
      </div>
      {/* Mobile (below 896px): listagem horizontal */}
      <div className="px-4 pb-6 max-[895px]:block min-[896px]:hidden">
        <div className="flex flex-col">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`border-b border-border py-4 ${index === 3 ? 'border-b-0 pb-0' : ''}`}
            >
              <div className="flex gap-3 items-center">
                <Skeleton className="w-26 h-26 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-1 mt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop (896px+): grid de 4 colunas */}
      <div className="hidden min-[896px]:block px-1 pb-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}

export default async function CoursesLoading() {
  const userInfo = await getUserInfoFromToken()

  return (
    <div className="min-h-lvh">
      <CoursesHeader userInfo={userInfo} />
      <main className="max-w-4xl mx-auto pb-34 text-white">
        {/* Category Filters - renderizando ambos e usando classes responsivas para evitar layout shift */}
        <div className="block sm:hidden">
          <CategoryFiltersMobileSkeleton />
        </div>
        <div className="hidden sm:block">
          <CategoryFiltersSwipeSkeleton />
        </div>

        <MyCoursesHomeSkeleton />

        <RecentlyAddedCoursesSwipeSkeleton />

        <AllCoursesSkeleton />
      </main>
    </div>
  )
}
