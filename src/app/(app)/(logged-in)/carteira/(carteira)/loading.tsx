import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { WalletContentLoadingSkeleton } from '@/app/components/wallet-page-loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletLoading() {
  return (
    <>
      <main className="pb-30 mx-auto h-full w-full max-w-[896px] text-white">
        <section className="relative h-full px-4">
          <div className="flex items-center justify-between pt-6 pb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          <WalletContentLoadingSkeleton />
        </section>
        <FloatNavigationWrapper />
      </main>
    </>
  )
}
