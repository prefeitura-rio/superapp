import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function FaqLoading() {
  return (
    <div className="text-foreground">
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
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <Skeleton className="h-9 w-56 mb-2 mt-0" />
        <Skeleton className="h-4 w-80 mb-5" />
        <Skeleton className="h-14 w-full rounded-full mb-4" />
        <div className="mt-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center justify-between py-5 border-b border-border last:border-0"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
