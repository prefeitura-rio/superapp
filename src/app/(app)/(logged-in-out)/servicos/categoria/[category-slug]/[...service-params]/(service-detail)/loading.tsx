import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServiceDetailLoading() {
  return (
    <div className="text-foreground">
      <div className="max-w-4xl mx-auto">
        {/* MainHeader skeleton */}
        <div className="w-full bg-background py-4 px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
        <BreadcrumbSkeleton />
        <main className="pb-20 px-4 flex flex-col gap-4 pt-2">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-12 w-full rounded-full mt-2" />
          <div className="flex flex-col gap-2 mt-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
