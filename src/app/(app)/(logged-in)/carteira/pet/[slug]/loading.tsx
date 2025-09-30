import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function PetPageLoading() {
  return (
    <div className="min-h-lvh max-w-xl mx-auto pb-10">
      <SecondaryHeader
        title="Carteira"
        route="/carteira"
        className="max-w-xl"
      />

      <div className="pt-25">
        <div className="px-4 space-y-6">
          {/* Pet Card */}
          <Skeleton className="w-full h-[185px] rounded-2xl" />

          {/* Icon Buttons */}
          <div className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>

          {/* Status Card */}
          <Skeleton className="w-full h-24 rounded-lg" />

          {/* Tutor Info */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* QR Code */}
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
