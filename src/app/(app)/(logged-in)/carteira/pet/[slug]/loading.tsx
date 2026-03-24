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
        <div className="px-4 flex flex-col gap-4">
          <Skeleton className="w-full h-[185px] rounded-2xl" />
          <div className="flex justify-center gap-1">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-4 gap-4 justify-start mt-8 min-w-max">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 mt-6">
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="mb-8 px-4 mt-4">
          <div className="bg-card rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
