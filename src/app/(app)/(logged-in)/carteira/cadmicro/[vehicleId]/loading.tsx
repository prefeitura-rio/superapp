import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function VehicleDetailLoading() {
  return (
    <div className="text-foreground">
      {/* MainHeader skeleton */}
      <div className="w-full bg-background py-4">
        <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
      <BreadcrumbSkeleton />
      <div className="mx-auto w-full max-w-4xl pb-10">
        <div className="flex flex-col gap-6 px-4 pt-2">
          {/* Vehicle card skeleton */}
          <Skeleton className="w-full h-47.5 rounded-3xl" />
          {/* Detail accordion skeleton */}
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
