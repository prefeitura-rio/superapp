import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function TermosDeUsoPlataformaLoading() {
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
      <div className="mx-auto w-full max-w-4xl px-4 pb-10">
        <Skeleton className="h-9 w-8 mt-6 mb-4" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-sm mb-6" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
