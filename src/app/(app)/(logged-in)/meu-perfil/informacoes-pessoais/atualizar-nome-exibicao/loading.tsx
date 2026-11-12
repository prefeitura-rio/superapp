import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserEmailLoading() {
  return (
    <div className="max-w-xl mx-auto flex flex-col space-y-6">
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
      <div className="flex flex-col gap-14 px-4 items-center">
        {/* Input field skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />

        {/* Save button skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}
