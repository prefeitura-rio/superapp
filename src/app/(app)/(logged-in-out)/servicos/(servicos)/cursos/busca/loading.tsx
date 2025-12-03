import { FilterIcon } from '@/assets/icons/filter-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SearchInput } from '@/components/ui/custom/search-input'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesSearchLoading() {
  return (
    <main className="min-h-lvh max-w-4xl mx-auto text-foreground">
      <section className="relative pt-5 px-4 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
        <div className="relative shrink-0">
          <div className="bg-card w-14 h-14 p-4 rounded-full flex items-center justify-center">
            <FilterIcon />
          </div>
        </div>
      </section>

      <div className="px-4 pb-30 mt-6 space-y-6">
        {/* Cursos mais procurados skeleton */}
        <div>
          <Skeleton className="h-5 w-40 mb-4" />
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`border-b border-border py-4 ${
                  i === 3 ? 'border-b-0 pb-0' : ''
                }`}
              >
                <div className="flex gap-3 items-center">
                  <Skeleton className="w-28 h-28 shrink-0 rounded-lg" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-20 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
