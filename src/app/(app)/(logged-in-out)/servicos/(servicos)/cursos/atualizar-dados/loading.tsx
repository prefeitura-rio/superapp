import { Skeleton } from '@/components/ui/skeleton'

export default function AtualizarDadosLoading() {
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
        <div className="max-w-xl mx-auto px-4 pt-2 pb-10">
          <div className="pt-2 pb-6">
            <Skeleton className="h-9 w-80" />
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-5 gap-4 border-b border-border">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex flex-col min-w-0 flex-1 gap-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="flex items-center justify-between py-5 gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex flex-col min-w-0 flex-1 gap-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </div>
          <div className="pt-8 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
