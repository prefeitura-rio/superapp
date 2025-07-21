import { FloatNavigation } from '@/app/components/float-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletAuthenticationRequiredLoading() {
  return (
    <>
      <main className="flex max-w-xl mx-auto min-h-lvh flex-col bg-background text-foreground pb-32">
        {/* Header Skeleton */}
        <div className="px-4 pt-8 pb-4">
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col justify-center space-y-8">
          {/* Title and Description Skeleton */}
          <div className="px-4 text-left space-y-2">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Wallet Cards Image Skeleton */}
          <div className="relative w-full overflow-hidden">
            <div className="flex justify-center">
              <Skeleton className="w-[160%] max-w-none h-48" />
            </div>
          </div>

          {/* Gov.br Login Section Skeleton */}
          <div className="px-4 w-full space-y-2">
            <div className="text-center">
              <Skeleton className="h-4 w-48 mx-auto mb-4" />
            </div>

            {/* Gov.br Button Skeleton */}
            <div className="flex justify-center">
              <Skeleton className="w-[216px] h-[55px] rounded-2xl" />
            </div>

            {/* Create Account Link Skeleton */}
            <div className="text-center pt-2">
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        </div>
      </main>

      {/* Float Navigation */}
      <FloatNavigation />
    </>
  )
}
