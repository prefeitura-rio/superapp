import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesCategoryLoading() {
  return (
    <div className="text-foreground">
      {/* MainHeader skeleton */}
      <div className="w-full bg-background py-4">
        <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
      {/* OportunidadesCariocas band skeleton */}
      <div className="w-full bg-card py-4">
        <div className="mx-auto px-4 max-w-4xl">
          <Skeleton className="h-9 w-44" />
        </div>
      </div>
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--card) 0%, var(--background) 100%) top / 100% 210px no-repeat',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-10">
          <Skeleton className="h-9 w-48 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Skeleton className="w-28 h-28 shrink-0 rounded-lg" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-24 rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
