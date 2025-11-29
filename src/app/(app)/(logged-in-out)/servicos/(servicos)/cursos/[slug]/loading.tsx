import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseDetailLoading() {
  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        {/* Header Skeleton - Cover Image with Title */}
        <div className="h-[320px] md:h-[380px] w-full relative">
          {/* Back Button Skeleton */}
          <Skeleton className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full" />

          {/* Cover Image Skeleton */}
          <Skeleton className="w-full h-full" />

          {/* Badges Skeleton */}
          <div className="absolute top-6 right-2 flex flex-col gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Title Skeleton at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end gap-2">
            <Skeleton className="h-5 w-5/6 md:h-7 md:w-4/5 bg-white/20 rounded-full" />
            <Skeleton className="h-5 w-3/4 md:h-7 md:w-2/3 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Course Info Skeleton - Organization Logo and Name */}
        <div className="flex p-4 gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>

        {/* Course Metadata Skeleton - Modalidade, Carga horária, Inscrições até */}
        <div className="flex justify-between px-4 text-sm">
          <div className="flex gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="px-4 py-6 pb-0 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* First Action Button Skeleton */}
        <div className="px-4 pb-2 py-8 w-full max-w-4xl">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>

        {/* Location Selection Skeleton */}
        <div className="space-y-4">
          {/* Location Icon Label */}
          <div className="pt-12 px-4 flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Horizontal Scrollable Location Cards */}
          <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-3 pl-4 pb-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[280px] p-4 rounded-lg border-1 bg-card"
                >
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
              <div className="flex-shrink-0 w-4" aria-hidden="true" />
            </div>
          </div>

          {/* Separator */}
          <Separator className="max-w-[90%] md:max-w-[96%] mx-auto" />

          {/* Schedule Information Skeleton */}
          <div className="px-4 space-y-4">
            <div className="w-full space-y-3">
              {/* Group Icon and Label */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Schedule Details */}
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="my-12" />

        {/* Course Content Sections Skeleton */}
        <div className="px-4 space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                {index < 2 && (
                  <>
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Button Skeleton */}
        <div className="p-4 w-full max-w-4xl pt-8">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
