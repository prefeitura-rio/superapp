import { FloatNavigation } from '@/app/components/float-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletLoading() {
  return (
    <>
      <main className="pb-30 max-w-xl mx-auto text-white">
        <section className="px-4 relative h-full">
          <div className="flex items-start justify-between pt-6 pb-6">
            <Skeleton className="h-8 w-32" />
            {/* Search button skeleton */}
            <Skeleton className="rounded-full h-12 w-12" />
          </div>

          <div className="grid w-full gap-2">
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
