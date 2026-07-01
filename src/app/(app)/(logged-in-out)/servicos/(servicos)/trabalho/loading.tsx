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
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-[#3E5782] p-4">
      {/* Header: logo + nome + data */}
      <div className="flex items-start gap-2 shrink-0">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-white/30" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-24 rounded bg-white/30" />
          <div className="h-3 w-16 rounded bg-white/20" />
        </div>
      </div>

      {/* Title — 2 linhas */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-white/30" />
        <div className="h-4 w-3/4 rounded bg-white/30" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <RecentBadgeSkeleton width="w-16" />
        <RecentBadgeSkeleton width="w-12" />
        <RecentBadgeSkeleton width="w-10" />
      </div>
    </div>
  )
}

function AllVagaCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-card p-6">
      {/* Header: logo + nome + data */}
      <div className="flex items-start gap-2 shrink-0">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-foreground/10 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-32 rounded bg-foreground/10 animate-pulse" />
          <div className="h-3 w-20 rounded bg-foreground/5 animate-pulse" />
        </div>
      </div>

      {/* Title — 2 linhas */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-foreground/10 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-foreground/10 animate-pulse" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <AllBadgeSkeleton width="w-20" />
        <AllBadgeSkeleton width="w-14" />
        <AllBadgeSkeleton width="w-12" />
      </div>
    </div>
  )
}

function RecentlyAddedVagasSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between pb-2 px-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-1">
          <div className="size-5 rounded bg-muted animate-pulse" />
          <div className="size-5 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="mx-4 overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[262px] h-[188px]">
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
      <Skeleton className="h-5 w-40 mb-2 mx-4" />
      <div className="mt-4 px-4 pb-6 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full h-[200px]">
            <AllVagaCardSkeleton />
          </div>
        ))}
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
