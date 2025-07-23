import { Skeleton } from '@/components/ui/skeleton'

export default function UserAuthorizationsLoading() {
  return (
    <div className="max-w-md min-h-lvh mx-auto pt-28 flex flex-col space-y-4">
      {/* Fixed header skeleton mimicking SecondaryHeader */}
      <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-start max-w-md mx-auto z-50 bg-background text-foreground h-16">
        <Skeleton className="h-12 w-12 rounded-full" />
      </header>

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
