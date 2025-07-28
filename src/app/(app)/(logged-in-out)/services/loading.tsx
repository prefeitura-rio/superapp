import { FloatNavigation } from '@/app/components/float-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServicesLoading() {
  return (
    <main className="flex max-w-4xl mx-auto flex-col bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="px-4 py-6 flex justify-between items-start">
        <Skeleton className="h-8 w-24" />
        {/* SearchButton Skeleton */}
        <Skeleton className="h-11 w-11 rounded-full" />
      </header>

      {/* Most Accessed Services Skeleton - Mobile */}
      <div className="mb-8 sm:hidden">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-2 px-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Horizontal Scrollable Cards */}
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2 px-4 w-max">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton
                key={index}
                className="rounded-lg p-3.5 w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px] flex flex-col justify-between"
              >
                {/* Icon Skeleton */}
                <div className="mb-4">
                  <Skeleton className="bg-gray-500/15 w-10 h-10 rounded-lg" />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <Skeleton className="bg-gray-500/15 h-4 w-16" />
                  <Skeleton className="bg-gray-500/15 h-3 w-full" />
                  <Skeleton className="bg-gray-500/15 h-3 w-20" />
                </div>
              </Skeleton>
            ))}
          </div>
        </div>
      </div>

      {/* Most Accessed Services Skeleton - Desktop */}
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
        <div className="justify-center items-center h-9 flex">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Category Grid Skeleton */}
      <div className="text-foreground space-y-2 px-4 pt-6 pb-24">
        {/* Section Title */}
        <Skeleton className="h-5 w-24 mb-4" />

        {/* Responsive Grid - matches CategoryGrid breakpoints */}
        <div className="grid grid-cols-2 min-[360px]:grid-cols-3 min-[900px]:grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Category Card */}
              <Skeleton className="w-full aspect-square rounded-xl max-h-[90px]" />

              {/* Category Name */}
              <Skeleton className="h-4 w-16 mt-2" />
            </div>
          ))}
        </div>
      </div>
      <FloatNavigation />
    </main>
  )
}
