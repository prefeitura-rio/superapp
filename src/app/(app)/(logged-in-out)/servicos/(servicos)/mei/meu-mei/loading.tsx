import { Skeleton } from '@/components/ui/skeleton'

function MeiDataItemSkeleton() {
  return (
    <div className="flex flex-col py-4 border-b border-border">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  )
}

export default function MeuMeiLoading() {
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
        <div className="max-w-xl mx-auto px-4 pt-4 pb-12">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex flex-col">
            <MeiDataItemSkeleton />
            <MeiDataItemSkeleton />
            <MeiDataItemSkeleton />
            <MeiDataItemSkeleton />
            <MeiDataItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
