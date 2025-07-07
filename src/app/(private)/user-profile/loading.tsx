import { Skeleton } from '@/components/ui/skeleton'
import { SecondaryHeader } from '../components/secondary-header'

export default function UserProfileLoading() {
  return (
    <div className="pt-20 min-h-lvh max-w-md mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Perfil" />

      {/* Profile Info Skeleton */}
      <div className="flex flex-col items-center mt-6 mb-10">
        <Skeleton className="h-24 w-24 mb-4 rounded-full border-2" />
        <Skeleton className="h-6 w-48 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Menu Items Skeleton */}
      <div className="flex-1 px-4">
        <nav className="divide-y divide-border">
          {/* Menu Item Skeletons */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-30" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          {/* Install PWA Button Skeleton */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          {/* Logout Button Skeleton */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </nav>
      </div>
    </div>
  )
}
