import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  const dynamicMarginBottom = 'calc(100lvh - (116px + 188px + 240px))'
  return (
    <main className="flex max-w-md mx-auto pt-21 flex-col bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground py-4">
        <div className="mx-auto px-4 flex max-w-md items-center justify-between">
          {/* Left side - User info skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="rounded-full h-12 w-12" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </header>

      {/* Search Placeholder Skeleton */}
      <div className="px-4 mb-6">
        <Skeleton className="h-14 w-full rounded-full" />
      </div>

      {/* Suggestion Cards Skeleton */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          <Skeleton className="w-[85vw] max-w-[350px] h-[104px] rounded-2xl" />
          <Skeleton className="w-[85vw] max-w-[350px] h-[104px] rounded-2xl" />
        </div>
      </div>

      {/* Home Services Grid Skeleton */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          {/* First row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row1-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
          {/* Second row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row2-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Most Accessed Services Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-4 pt-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-4 px-4 w-max">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[140px] h-[140px] min-w-[140px]">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Section Skeleton */}
      <section className="px-4 mt-6">
        <div className="sticky top-20 flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div
          className="grid w-full gap-2"
          style={{ marginBottom: dynamicMarginBottom }}
        >
          {/* Wallet card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="sticky"
              style={{ top: `${116 + i * 80}px` }}
            >
              <Skeleton className="w-full h-[182px] rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
