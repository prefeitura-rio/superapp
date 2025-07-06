import { Skeleton } from '@/components/ui/skeleton'
import { FloatNavigation } from '../../components/float-navigation'

export default function WalletLoading() {
  // Hard-coded 4 cards as requested
  const cardCount = 4
  const dynamicMarginBottom = `calc(100vh - (80px + 188px + ${(cardCount - 1) * 80}px))`

  return (
    <>
      <main className="max-w-md mx-auto text-white">
        <section className="px-5 relative h-full">
          <h2 className="sticky top-6 text-2xl font-bold mb-6 bg-background z-10 text-foreground">
            <Skeleton className="h-8 w-32" />
          </h2>

          <div
            className="grid w-full gap-2 pt-6"
            style={{ marginBottom: dynamicMarginBottom }}
          >
            {/* Card 1: Health */}
            <div className="sticky" style={{ top: `${80 + 0 * 80}px` }}>
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>

            {/* Card 2: Education */}
            <div className="sticky" style={{ top: `${80 + 1 * 80}px` }}>
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>

            {/* Card 3: Social Assistance */}
            <div className="sticky" style={{ top: `${80 + 2 * 80}px` }}>
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>

            {/* Card 4: Caretaker */}
            <div className="sticky" style={{ top: `${80 + 3 * 80}px` }}>
              <Skeleton className="w-full h-[190px] rounded-3xl" />
            </div>
          </div>
        </section>
        <FloatNavigation />
      </main>
    </>
  )
}
