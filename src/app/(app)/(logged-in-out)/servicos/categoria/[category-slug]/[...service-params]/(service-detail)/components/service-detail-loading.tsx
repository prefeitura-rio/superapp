import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function ServiceDetailLoading() {
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
        <main className="pb-20 px-4 pt-2">
          {/* h1 (text-4xl = 40px) + resumo + botão CTA */}
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-[52px] w-full rounded-full" />
          </div>

          {/* QuickInfo — custo / tempo / categoria */}
          <div className="flex flex-col gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>

          {/* MainInformation — "Principais informações" + text blocks */}
          <div className="space-y-6">
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
