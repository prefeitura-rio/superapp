import { CategoryFiltersMobileSkeleton } from '@/app/components/courses/category-filters-mobile-skeleton'
import { CategoryFiltersSwipeSkeleton } from '@/app/components/courses/category-filters-swipe-skeleton'
import { RecentlyAddedCoursesSwipeSkeleton } from '@/app/components/courses/recently-added-courses-skeleton'
import { RecommendedCoursesSwipeSkeleton } from '@/app/components/courses/recommended-courses-swipe-skeleton'
import { FloatNavigation } from '@/app/components/float-navigation'
import { ServiceTypeToggleSkeleton } from '@/app/components/mei'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesLoading() {
  return (
    <>
      <div className="min-h-lvh">
        {/* Header Skeleton */}
        <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
          <div className="mx-auto pt-2 md:px-4 flex max-w-4xl items-center justify-between">
            <div className="flex justify-center">
              <Skeleton className="h-9 w-44 rounded-full" />
            </div>
            <div className="flex items-center space-x-8 px-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto pt-24 pb-34 text-white">
          {/* Service Type Toggle Skeleton */}
          <div className="my-4 mb-10 px-4">
            <ServiceTypeToggleSkeleton />
          </div>

          {/* Category Filters Skeleton */}
          <div className="block sm:hidden">
            <CategoryFiltersMobileSkeleton />
          </div>
          <div className="hidden sm:block">
            <CategoryFiltersSwipeSkeleton />
          </div>

          {/* My Courses Skeleton */}
          <div className="px-4 pb-6">
            <Skeleton className="h-5 w-24 mb-4" />
            {/* Mobile: horizontal scroll */}
            <div className="relative w-full overflow-x-auto pb-2 no-scrollbar max-[576px]:block min-[577px]:hidden">
              <div className="flex gap-2 px-4 min-w-max">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[197px] rounded-xl overflow-hidden bg-background shrink-0"
                  >
                    <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        <Skeleton className="w-[15px] h-[15px] rounded-full" />
                      </div>
                    </div>
                    <div className="py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden min-[577px]:block">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-xl overflow-hidden bg-background"
                  >
                    <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        <Skeleton className="w-[15px] h-[15px] rounded-full" />
                      </div>
                    </div>
                    <div className="py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Courses Skeleton */}
          <RecommendedCoursesSwipeSkeleton />

          {/* Recently Added Courses Skeleton */}
          <RecentlyAddedCoursesSwipeSkeleton />

          {/* All Courses Skeleton */}
          <div className="px-4 pb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            {/* Mobile: vertical list */}
            <div className="max-[576px]:block min-[577px]:hidden">
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl overflow-hidden bg-background"
                  >
                    <div className="relative w-30 h-30 overflow-hidden rounded-xl shrink-0">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 py-2">
                      <div className="space-y-1 mb-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden min-[577px]:block">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-xl overflow-hidden bg-background"
                  >
                    <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        <Skeleton className="w-[15px] h-[15px] rounded-full" />
                      </div>
                    </div>
                    <div className="py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <FloatNavigation />
    </>
  )
}
