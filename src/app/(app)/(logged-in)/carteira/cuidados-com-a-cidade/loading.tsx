import { Skeleton } from '@/components/ui/skeleton'

export default function WalletCaretakerLoading() {
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
      <div className="max-w-4xl mx-auto pb-10">
        <div className="z-50">
          <div className="px-4 pt-2">
            <div className="sticky top-34">
              <Skeleton className="w-full h-47.5 rounded-3xl" />
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
              {[1, 2].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="rounded-full w-16 h-16" />
                  <div className="flex flex-col items-center">
                    <Skeleton className="mt-2 h-4 w-16" />
                    <Skeleton className="mt-1 h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-2">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-full h-28 rounded-lg" />
            <Skeleton className="w-full h-28 rounded-lg" />
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
