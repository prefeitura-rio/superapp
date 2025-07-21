import { Skeleton } from '@/components/ui/skeleton'
import { FloatNavigation } from '../components/float-navigation'

export default function ServicesLoading() {
  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="px-4 py-6">
        <Skeleton className="h-8 w-24" />
      </header>

      {/* Most Accessed Services Cards Skeleton */}
      <div className="mb-8">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-2 px-4">
          <Skeleton className="h-5 w-32" />
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

      {/* Category Grid Skeleton */}
      <div className="text-foreground space-y-2 px-4 pt-8 pb-24">
        {/* Section Title */}
        <Skeleton className="h-5 w-24 mb-4" />

        {/* 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Category Card */}
              <Skeleton className="w-full aspect-square rounded-xl" />

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
