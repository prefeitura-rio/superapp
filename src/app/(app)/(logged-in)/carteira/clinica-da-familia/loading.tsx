import { Skeleton } from '@/components/ui/skeleton'

export default function WalletHealthLoading() {
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
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="rounded-full w-16 h-16" />
                  <div className="flex flex-col items-center">
                    <Skeleton className="mt-2 h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-5 w-48 mb-2" />
          <div className="flex flex-col gap-2">
            <div className="w-full rounded-xl bg-card shadow-none">
              <div className="px-4 py-4 flex gap-4 items-center">
                <Skeleton className="w-6 h-6 rounded-none" />
                <div className="flex flex-col flex-1 gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            </div>
            <div className="w-full rounded-xl bg-card shadow-none">
              <div className="px-4 py-4 flex gap-4 items-center">
                <Skeleton className="w-6 h-6 rounded-none" />
                <div className="flex flex-col flex-1 gap-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-44" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
