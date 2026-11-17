import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function MapaDoSiteLoading() {
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
        <Skeleton className="h-5 w-32 mb-1 mt-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="flex flex-col gap-4">
          {/* Informações section */}
          <div className="rounded-2xl bg-card p-5 flex flex-col gap-4">
            <Skeleton className="h-5 w-28" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
          {/* Serviços section */}
          <div className="rounded-2xl bg-card p-5 flex flex-col gap-4">
            <Skeleton className="h-5 w-20" />
            <div className="grid grid-cols-1 min-[896px]:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
          {/* Atendimento + Oportunidades */}
          <div className="grid grid-cols-1 min-[896px]:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-card p-5 flex flex-col gap-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card p-5 flex flex-col gap-4">
              <Skeleton className="h-5 w-40" />
              <div className="flex flex-col gap-2">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
