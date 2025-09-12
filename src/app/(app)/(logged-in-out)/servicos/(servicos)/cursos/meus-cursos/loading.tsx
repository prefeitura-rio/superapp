import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function MyCoursesLoading() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <SecondaryHeader title="Meus cursos" route="/servicos/cursos/opcoes" />

      {/* Course Cards Skeleton */}
      <div className="relative overflow-hidden mt-16 px-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg py-3 bg-background"
            >
              {/* Course Image Skeleton */}
              <div className="relative w-30 h-30 overflow-hidden rounded-xl">
                <Skeleton className="w-full h-full" />
              </div>

              {/* Course Content Skeleton */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Course Title Skeleton */}
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />

                {/* Status Badge Skeleton */}
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}






