import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { Skeleton } from '@/components/ui/skeleton'

function RecentlyAddedVagasSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-40 mb-2 px-4" />
      {/* Mobile: cards 11.75rem em linha com scroll horizontal */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[576px]:block min-[577px]:hidden">
        <div className="flex gap-2 px-4 min-w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 h-[11.75rem] w-[11.75rem]">
              <div className="flex h-full w-full min-h-0 flex-col justify-between rounded-3xl bg-card p-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="size-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: 3 }).map((_, badgeIndex) => (
                    <Skeleton
                      key={badgeIndex}
                      className="h-5 w-20 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 4 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full min-h-[11.75rem]">
              <div className="flex h-full flex-col justify-between rounded-3xl bg-card p-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="size-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                {/* Title */}
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {Array.from({ length: 3 }).map((_, badgeIndex) => (
                    <Skeleton
                      key={badgeIndex}
                      className="h-5 w-24 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function AllVagasSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-40 mb-2 px-4" />
      {/* Mobile: layout empilhado, cards 10.25rem de altura */}
      <div className="px-4 pb-6 max-[576px]:block min-[577px]:hidden">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[10.25rem] min-h-[10.25rem] rounded-3xl bg-card p-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              {/* Title */}
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Array.from({ length: 3 }).map((_, badgeIndex) => (
                  <Skeleton
                    key={badgeIndex}
                    className="h-5 w-24 rounded-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 2 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full min-h-[10.25rem] rounded-3xl bg-card p-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>

              {/* Title */}
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, badgeIndex) => (
                  <Skeleton
                    key={badgeIndex}
                    className="h-5 w-28 rounded-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function EmpregosLoading() {
  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-20 text-foreground">
        <RecentlyAddedVagasSkeleton />
        <AllVagasSkeleton />
      </main>
    </div>
  )
}
