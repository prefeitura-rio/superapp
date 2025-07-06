import { Skeleton } from '@/components/ui/skeleton'
import { SecondaryHeader } from '../../../components/secondary-header'

export default function WalletEducationLoading() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          {/* Wallet Education Card Skeleton */}
          <div className="sticky top-34">
            <Skeleton className="w-full h-[190px] rounded-3xl" />
          </div>
        </div>

        {/* Icons Buttons Row Skeleton - Only 3 buttons for education */}
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
          </div>
        </div>
      </div>

      {/* Desempenho Section Skeleton */}
      <div className="p-6">
        <div className="">
          <Skeleton className="h-5 w-32 mb-4" />

          <Skeleton className="w-full rounded-xl p-5">
            {/* Conceito Section Skeleton */}
            <div className="space-y-1 py-2">
              <div className="text-sm space-y-1">
                <Skeleton className="h-4 w-16 bg-card" />
                <Skeleton className="h-4 w-24 bg-card" />
              </div>
            </div>

            {/* Separator */}
            <Skeleton className="my-4 w-full" />

            {/* Frequência Escolar Section Skeleton */}
            <div className="space-y-1 py-2">
              <div className="text-sm space-y-1">
                <Skeleton className="h-4 w-32 bg-card" />
                <Skeleton className="h-4 w-20 bg-card" />
              </div>
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  )
}
