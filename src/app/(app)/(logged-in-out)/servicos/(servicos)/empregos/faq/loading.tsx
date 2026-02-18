import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function FaqCoursesLoading() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto pt-15 text-foreground pb-10">
      <SecondaryHeader title="FAQ" />
      <div className="p-5 pt-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <div className="space-y-2">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-full max-w-md" />
                {/* Content skeleton - multiple lines */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              {index < 4 && <div className="mt-8 border-t border-border" />}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
