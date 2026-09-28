import { Skeleton } from '@/components/ui/skeleton'

export default function ConfirmarImovelLoading() {
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
      <div className="max-w-4xl mx-auto flex flex-col pb-4 px-4 pt-2">
        <div className="pb-6">
          <Skeleton className="mb-2 h-8 w-full" />
          <Skeleton className="h-8 w-44" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-13 flex-1 rounded-full" />
          <Skeleton className="h-13 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  )
}
