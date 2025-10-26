import { FloatNavigation } from '@/app/components/float-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletLoading() {
  return (
    <>
      <main className="pb-30 max-w-xl mx-auto text-white">
        <section className="px-4 relative h-full">
          <div className="flex items-start justify-between pt-6 pb-4">
            <Skeleton className="h-8 w-32" />
            {/* Search button skeleton */}
            <Skeleton className="rounded-full h-12 w-12" />
          </div>

          {/* WalletTabs skeleton */}
          <div className="relative inline-flex bg-card rounded-full p-1 w-full justify-center h-[52px] items-center">
            <Skeleton
              className="absolute top-1 bottom-1 rounded-full"
              style={{ left: '4px', width: 'calc(50% - 8px)' }}
            />
            <div className="relative z-10 flex-1 px-6 py-2 text-center">
              <Skeleton className="h-5 w-24 mx-auto" />
            </div>
            <div className="relative z-10 flex-1 px-6 py-2 text-center">
              <Skeleton className="h-5 w-20 mx-auto" />
            </div>
          </div>

          <div className="grid w-full gap-2 mt-6">
            {/* Wallet card skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="w-full h-[182px] rounded-lg" />
              </div>
            ))}
          </div>
        </section>
        <FloatNavigation />
      </main>
    </>
  )
}
