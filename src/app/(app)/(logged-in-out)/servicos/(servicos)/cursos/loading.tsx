import { CategoryFiltersMobileSkeleton } from '@/app/components/courses/category-filters-mobile-skeleton'
import { CategoryFiltersSwipeSkeleton } from '@/app/components/courses/category-filters-swipe-skeleton'
import CoursesHeader from '@/app/components/courses/courses-header'
import { RecentlyAddedCoursesSwipeSkeleton } from '@/app/components/courses/recently-added-courses-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserInfoFromToken } from '@/lib/user-info'

function MyCoursesHomeSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-32 mb-2 px-4" />
      {/* Mobile: 4 cards em linha com scroll horizontal */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[576px]:block min-[577px]:hidden">
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
      {/* Desktop: grid de 4 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
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
    </>
  )
}

function AllCoursesSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-32 mb-2 px-4" />
      {/* Mobile: layout horizontal */}
      <div className="px-4 pb-6 max-[576px]:block min-[577px]:hidden">
        <div className="flex flex-col">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`border-b border-border py-4 ${
                index === 3 ? 'border-b-0 pb-0' : ''
              }`}
            >
              <div className="flex gap-3 items-center">
                <Skeleton className="w-28 h-28 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 4 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
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
