'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CourseCardSkeletonProps {
  variant?: 'vertical' | 'horizontal'
  className?: string
}

export function CourseCardSkeleton({
  variant = 'vertical',
  className,
}: CourseCardSkeletonProps) {
  if (variant === 'horizontal') {
    return (
      <div className={cn('w-full flex gap-3', className)}>
        <div className="relative w-26 h-26 shrink-0 overflow-hidden rounded-xl">
          <Skeleton className="w-full h-full rounded-none bg-muted" />
          <div className="absolute top-1 left-1 z-20 w-6.5 h-6.5 rounded-full overflow-hidden border border-[#E2E8F0] bg-white">
            <Skeleton className="w-full h-full rounded-full bg-muted" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-2 min-w-0 gap-1">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-4/5 bg-muted" />
          <Skeleton className="h-3 w-28 bg-muted" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full bg-muted" />
            <Skeleton className="h-5 w-12 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-[212px] h-[252px] rounded-2xl overflow-hidden bg-card shrink-0 flex flex-col',
        className
      )}
    >
      <div className="relative w-full h-[100px] overflow-hidden">
        <Skeleton className="w-full h-full rounded-none bg-muted" />
        <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full overflow-hidden border border-[#E2E8F0] bg-white">
          <Skeleton className="w-full h-full rounded-full bg-muted" />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col flex-1">
        <div className="space-y-1">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
        <Skeleton className="mt-1 h-3 w-28 bg-muted" />
        <div className="flex flex-wrap gap-1 mt-auto pt-3">
          <Skeleton className="h-5 w-16 rounded-full bg-muted" />
          <Skeleton className="h-5 w-12 rounded-full bg-muted" />
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
