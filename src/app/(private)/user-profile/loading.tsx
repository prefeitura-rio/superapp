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
      <div className="flex-1 px-5 pt-4">
        <nav className="space-y-2">
          {/* Menu Item Skeletons*/}
          <Skeleton className="h-16 w-full rounded-xl " />
          <Skeleton className="h-16 w-full rounded-xl " />
          <Skeleton className="h-16 w-full rounded-xl " />
          <Skeleton className="h-16 w-full rounded-xl " />
          <Skeleton className="h-16 w-full rounded-xl " />
          <Skeleton className="h-16 w-full rounded-xl " />

          {/* Install PWA Button Skeleton */}
          <Skeleton className="h-16 w-full rounded-xl " />

          {/* Logout Button Skeleton */}
          <Skeleton className="h-16 w-full rounded-xl " />
        </nav>
      </div>
    </div>
  )
}
