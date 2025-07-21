import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletSocialAssistanceLoading() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-4">
          {/* Wallet Social Assistance Card Skeleton */}
          <div className="sticky top-34">
            <Skeleton className="w-full h-[190px] rounded-3xl" />
          </div>
        </div>

        {/* Icons Buttons Row Skeleton - 3 buttons for social assistance */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            {/* Phone Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-10" />
              </div>
            </div>

            {/* Map Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-10" />
              </div>
            </div>

            {/* Calendar Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
