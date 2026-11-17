import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ConsultaProtocoloLoading() {
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
      <main className="max-w-4xl mx-auto pb-32 px-4 flex flex-col gap-6 pt-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-13 w-full rounded-full" />
      </main>
    </div>
  )
}
