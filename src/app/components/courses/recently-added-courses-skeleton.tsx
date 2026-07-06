'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function CourseCardSkeleton() {
  return (
    <div className="w-[212px] h-[252px] rounded-2xl overflow-hidden bg-card shrink-0 flex flex-col">
      <div className="relative w-full h-[100px] overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full overflow-hidden">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col flex-1">
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-1 mt-auto pt-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function RecentlyAddedCoursesSwipeSkeleton() {
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
      <div className="hidden min-[896px]:block px-4 pb-6">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}
