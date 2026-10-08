import { Skeleton } from '@/components/ui/skeleton'

export default function VagaDetailLoading() {
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
        <div className="p-4 max-w-4xl mx-auto">
          <Skeleton className="h-52 w-full rounded-3xl bg-muted" />
          <div className="flex items-center gap-3 mt-4">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <Skeleton className="h-5 flex-1 max-w-50" />
          </div>
          <Skeleton className="h-16 w-full mt-4" />
          <Skeleton className="h-12 w-full mt-4 rounded-xl" />
          <Skeleton className="h-5 w-40 mt-6" />
          <Skeleton className="h-48 w-full mt-2 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
