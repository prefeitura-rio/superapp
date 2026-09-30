import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserAuthorizationsLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-4">
      <ProfileHeaderWrapper />

      <div className="space-y-4 mx-4">
        {/* Main heading skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* First paragraph skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Second paragraph skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* OptInSwitch skeleton */}
      <div className="mx-4 flex justify-start items-center gap-4">
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
