import { FloatNavigation } from '@/app/components/float-navigation'
import { ServiceTypeToggleSkeleton } from '@/app/components/mei'
import { Skeleton } from '@/components/ui/skeleton'

export default function MeiLoading() {
  return (
    <>
      <div className="min-h-lvh">
        {/* Header Skeleton */}
        <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
          <div className="mx-auto pt-2 md:px-4 flex max-w-4xl items-center justify-between">
            <div className="flex justify-center">
              <Skeleton className="h-9 w-44 rounded-full" />
            </div>
            <div className="flex items-center space-x-8 px-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto pt-24 pb-34 px-4">
          {/* Service Type Toggle Skeleton */}
          <div className="my-4 mb-12">
            <ServiceTypeToggleSkeleton />
          </div>

          <section>
            <Skeleton className="h-5 w-48 mb-4" />

            <div className="flex flex-col sm:hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="w-full rounded-xl overflow-hidden bg-background flex gap-3">
                    <div className="relative w-26 h-26 shrink-0 overflow-hidden rounded-xl">
                      <Skeleton className="w-full h-full" />
                    </div>
                    {/* Content skeleton */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  {i < 3 && <div className="h-px w-full bg-border my-4" />}
                </div>
              ))}
            </div>

            {/* Desktop: grid layout - 4 columns */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full rounded-xl overflow-hidden bg-background flex flex-col"
                >
                  {/* Image skeleton - desktop */}
                  <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                    <Skeleton className="w-full h-full" />
                  </div>
                  {/* Content skeleton */}
                  <div className="py-2">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <FloatNavigation />
    </>
  )
}
