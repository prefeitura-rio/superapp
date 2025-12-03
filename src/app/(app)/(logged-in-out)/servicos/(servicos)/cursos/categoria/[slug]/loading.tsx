import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesCategoryLoading() {
  return (
    <div className="min-h-lvh max-w-4xl mx-auto pt-26 pb-10">
      <SecondaryHeader title="Categoria" className="max-w-4xl" />

      <section className="px-4 mt-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-3 items-center">
              {/* Course Image Skeleton */}
              <Skeleton className="w-28 h-28 shrink-0 rounded-lg" />

              {/* Course Content Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Course Title Skeleton */}
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />

                {/* Modalidade and Workload Skeleton */}
                <Skeleton className="h-3 w-32" />

                {/* Accessibility Badge Skeleton */}
                <Skeleton className="h-6 w-24 rounded-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
