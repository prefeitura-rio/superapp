import { Skeleton } from '@/components/ui/skeleton'

function QuickInfoItemSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  )
}

export default function MeiOpportunityDetailLoading() {
  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        {/* Header Skeleton - Cover Image with Title */}
        <div className="h-[320px] md:h-[380px] w-full relative">
          {/* Back Button Skeleton */}
          <Skeleton className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full" />

          {/* Cover Image Skeleton */}
          <Skeleton className="w-full h-full" />

          {/* Title Skeleton at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end gap-2">
            <Skeleton className="h-7 w-5/6 md:h-8 md:w-4/5 bg-white/20 rounded-full" />
            <Skeleton className="h-6 w-3/4 md:h-7 md:w-2/3 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Service Type and Expiration Skeleton */}
        <div className="px-4 py-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="px-4 pb-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Action Button Skeleton */}
        <div className="px-4 pb-6">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>

        {/* Quick Info Items Skeleton */}
        <div className="px-4 space-y-4 pb-6">
          <QuickInfoItemSkeleton />
          <QuickInfoItemSkeleton />
          <QuickInfoItemSkeleton />
          <QuickInfoItemSkeleton />
          <QuickInfoItemSkeleton />
          <QuickInfoItemSkeleton />
        </div>

        {/* Attachment Gallery Skeleton */}
        <div className="py-6">
          <div className="px-4 mb-4">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-24 shrink-0 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
