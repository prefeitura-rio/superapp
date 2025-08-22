'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function RecommendedCoursesSwipeSkeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="px-4 pb-2">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`mobile-${i}`}
                className="w-[160px] h-[180px] rounded-xl shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block px-4 pb-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={`desktop-${i}`}
              className="w-full aspect-[4/5] rounded-xl"
            />
          ))}
        </div>
        <div className="flex justify-center items-center mt-4 gap-1.5">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
      </div>
    </>
  )
}
