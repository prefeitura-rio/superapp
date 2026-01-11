import { SecondaryHeader } from '@/app/components/secondary-header'
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
    <main className="max-w-xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader defaultRoute="/servicos/mei/menu" fixed={false} />
      <div className="px-4 pt-4 pb-12">
        {/* Company name skeleton */}
        <Skeleton className="h-8 w-3/4 mb-4" />

        {/* Status badge skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Data items skeletons */}
        <div className="flex flex-col">
          <MeiDataItemSkeleton />
          <MeiDataItemSkeleton />
          <MeiDataItemSkeleton />
          <MeiDataItemSkeleton />
          <MeiDataItemSkeleton />
        </div>
      </div>
    </main>
  )
}
