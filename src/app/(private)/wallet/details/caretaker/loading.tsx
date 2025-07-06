import { Skeleton } from '@/components/ui/skeleton'
import { SecondaryHeader } from '../../../components/secondary-header'

export default function WalletCaretakerLoading() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          {/* Wallet Caretaker Card Skeleton */}
          <div className="sticky top-34">
            <Skeleton className="w-full h-[190px] rounded-3xl" />
          </div>
        </div>

        {/* Icons Buttons Row Skeleton - 2 buttons for caretaker */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            {/* Phone Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>
            </div>

            {/* Globe/Website Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-14" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calls Section Skeleton */}
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
  )
}
