import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserSettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <ProfileHeaderWrapper />

      {/* Radio Group skeleton */}
      <div className="mx-6 divide-y divide-border">
        {/* Light Mode Option skeleton */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>

        {/* Dark Mode Option skeleton */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-5 w-30" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  )
}
