import { Skeleton } from '@/components/ui/skeleton'

export default function NovoImovelLoading() {
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
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-4 h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
