import { Skeleton } from '@/components/ui/skeleton'
import { FloatNavigation } from '../components/float-navigation'
import MainHeader from '../components/main-header'

export default function WalletLoading() {
  return (
    <>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-24">
          <h2 className="sticky top-16 text-2xl font-bold mb-6 bg-background z-10 pt-5 text-foreground">
            Carteira
          </h2>

          <div className="grid w-full gap-3">
            <div className="sticky top-34">
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>
            <div className="sticky top-34">
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>
            <div className="sticky top-34">
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>
            <div className="sticky top-34">
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>
          </div>
        </section>
        <FloatNavigation />
      </main>
    </>
  )
}
