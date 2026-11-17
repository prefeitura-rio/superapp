import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReclamacaoLoading() {
  return (
    <div className="pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* MainHeader skeleton */}
      <div className="w-full bg-background py-4">
        <div className="mx-auto px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
      <BreadcrumbSkeleton />
      <main className="flex flex-col px-4 gap-4 pt-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
        </div>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="w-full h-18 rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
