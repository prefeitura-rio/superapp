import { Skeleton } from '@/components/ui/skeleton'

function CandidaturaCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-4 flex flex-col gap-4">
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="flex-1 flex flex-col justify-center space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export default function MinhasCandidaturasLoading() {
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

      <div>
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-10">
          <Skeleton className="h-9 w-52 mb-2" />
          <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CandidaturaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
