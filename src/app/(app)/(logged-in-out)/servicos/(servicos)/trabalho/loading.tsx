import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { Skeleton } from '@/components/ui/skeleton'

function RecentBadgeSkeleton({ width }: { width: string }) {
  return <div className={`h-6 rounded-full bg-white/20 ${width}`} />
}

function AllBadgeSkeleton({ width }: { width: string }) {
  return (
    <div
      className={`h-6 rounded-full bg-foreground/5 animate-pulse ${width}`}
    />
  )
}

function RecentVagaCardSkeleton() {
  return (
    <div className="flex h-full w-full min-h-0 flex-col justify-between rounded-3xl bg-[#3E5782] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-white/30 flex items-center justify-center" />
        <div className="h-3 w-24 rounded bg-white/30" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-white/30" />
        <div className="h-4 w-3/4 rounded bg-white/30" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <RecentBadgeSkeleton width="w-12" />
        <RecentBadgeSkeleton width="w-16" />
        <RecentBadgeSkeleton width="w-10" />
      </div>
    </div>
  )
}

function AllVagaCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-white/30" />
        <div className="h-3 w-32 rounded bg-foreground/10 animate-pulse" />
      </div>

      {/* Title */}
      <div className="mt-2 space-y-2">
        <div className="h-4 w-full rounded bg-foreground/10 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-foreground/10 animate-pulse" />
      </div>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
        <AllBadgeSkeleton width="w-14" />
        <AllBadgeSkeleton width="w-10" />
        <AllBadgeSkeleton width="w-16" />
      </div>
    </div>
  )
}

function RecentlyAddedVagasSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-40 mb-2 px-6 mx-4" />
      {/* Mobile: cards 11.75rem em linha com scroll horizontal */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[576px]:block min-[577px]:hidden">
        <div className="flex gap-2 px-4 min-w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 h-49.5 w-49.5">
              <RecentVagaCardSkeleton />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 4 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full md:aspect-square">
              <RecentVagaCardSkeleton />
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
            <div key={i} className="w-full h-41 min-h-41">
              <AllVagaCardSkeleton />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 2 colunas */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full min-h-41">
              <AllVagaCardSkeleton />
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
