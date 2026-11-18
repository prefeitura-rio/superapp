import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function CartaDeServicosLoading() {
  return (
    <div className="w-full bg-background text-foreground">
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
      <div className="w-full max-w-4xl mx-auto px-4 pb-10">
        <Skeleton className="h-9 w-52 mb-2 mt-2" />
        <Skeleton className="h-4 w-full max-w-sm mb-1" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
