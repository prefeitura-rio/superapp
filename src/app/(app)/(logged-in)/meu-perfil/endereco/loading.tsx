import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserAddressLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <ProfileHeaderWrapper />

      {/* Address card skeleton */}
      <div className="px-4">
        <Skeleton className="w-full h-36 rounded-2xl" />
      </div>
    </div>
  )
}
