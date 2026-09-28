import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function AddressFormLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <div>
        <ProfileHeaderWrapper />

        <section className="relative">
          {/* Large heading skeleton - 2 lines */}
          <div className="px-4 pt-1 pb-3">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-12 w-32" />
          </div>
        </section>
      </div>

      <div className="px-4">
        {/* Search input skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />

        {/* Suggestions skeleton */}
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
