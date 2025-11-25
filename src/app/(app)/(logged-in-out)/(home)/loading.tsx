import { FloatNavigation } from '@/app/components/float-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <main className="flex w-full mx-auto max-w-4xl flex-col bg-background text-foreground pb-30">
      {/* Header Skeleton */}
      <header className="relative w-full z-50 bg-background text-foreground py-4">
        <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
          {/* Left side - User info skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="rounded-full h-10 w-10" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          {/* Right side - Pref logo skeleton */}
          <Skeleton className="h-8 w-20" />
        </div>
      </header>

      {/* Search Placeholder Skeleton */}
      <div className="px-4 mb-2">
        <Skeleton className="h-14 w-full rounded-full" />
      </div>

      {/* Suggestion Cards Skeleton */}
      <>
        {/* Mobile */}
        <div className="relative w-full overflow-x-auto overflow-y-hidden pb-3 no-scrollbar sm:hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-4 py-2 w-max">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`mobile-${i}`} className="flex flex-col">
                  <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="px-4 pb-0 mb-0 overflow-x-hidden mt-2 hidden sm:block">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
            </div>
            <div className="flex flex-col">
              <Skeleton className="w-full h-[104px] rounded-xl min-w-[328px]" />
            </div>
          </div>
          <div className="justify-center items-center h-12 w-full flex">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2 h-1.5 rounded-full" />
              <Skeleton className="w-2 h-1.5 rounded-full" />
              <Skeleton className="w-2 h-1.5 rounded-full" />
            </div>
          </div>
        </div>
      </>

      {/* Home Categories Grid Skeleton */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex flex-col items-center">
              <div className="flex flex-col items-center justify-center p-2 bg-card rounded-2xl aspect-square w-full max-h-19 min-h-18">
                <Skeleton className="text-3xl mb-1 h-6 w-6" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-3 w-8 sm:w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton pagination bullets */}
        <div className="flex justify-center items-center h-12">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Most Accessed Services Skeleton */}
      <>
        {/* Mobile */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2 px-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2 px-4 w-max">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`mobile-${i}`} className="flex flex-col">
                    <Skeleton className="bg-card rounded-lg p-3.5 flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="px-4 pb-4 overflow-x-hidden hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`service-${i}`} className="flex flex-col">
                <Skeleton className="w-full aspect-square rounded-lg mb-2 h-[140px]" />
              </div>
            ))}
          </div>
          <div className="justify-center items-center h-12 flex">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2 h-1.5 rounded-full" />
              <Skeleton className="w-2 h-1.5 rounded-full" />
            </div>
          </div>
        </div>
      </>

      {/* Wallet Section Skeleton */}
      <section className="mt-4 w-full overflow-x-auto sm:mt-0">
        <div className="flex items-center px-4 justify-between mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`wallet-card-${i}`} className="min-w-[300px]">
                <Skeleton className="w-full h-[200px] rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <FloatNavigation />
    </main>
  )
}
