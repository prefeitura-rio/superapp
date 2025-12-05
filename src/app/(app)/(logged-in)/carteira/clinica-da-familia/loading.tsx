import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function WalletHealthLoading() {
  return (
    <div className="min-h-lvh max-w-xl mx-auto pt-2 pb-10">
      <SecondaryHeader title="Carteira" className="max-w-xl" fixed={false} />
      <div className="z-50">
        <div className="px-4">
          {/* Wallet Health Card Skeleton */}
          <div className="sticky top-36">
            <Skeleton className="w-full h-[190px] rounded-3xl" />
          </div>
        </div>

        {/* Icons Buttons Row Skeleton */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            {/* Phone Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-12" />
              </div>
            </div>

            {/* WhatsApp Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-1 h-3 w-12" />
              </div>
            </div>

            {/* Map Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
            </div>

            {/* Calendar Button Skeleton */}
            <div className="flex flex-col items-center">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex flex-col items-center">
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Page Skeleton */}
      <div className="p-6">
        <Skeleton className="h-5 w-48 mb-2" />

        <div className="flex flex-col gap-2">
          {/* Doctors Card Skeleton */}
          <div className="w-full rounded-xl bg-card shadow-none">
            <div className="px-4 py-4 flex gap-4 items-center">
              <Skeleton className="w-6 h-6 rounded-none" />
              <div className="flex flex-col flex-1 gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>

          {/* Nurses Card Skeleton */}
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
  )
}
