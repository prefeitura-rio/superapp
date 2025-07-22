import { Skeleton } from '@/components/ui/skeleton'

export default function UserSettingsLoading() {
  return (
    <div className="max-w-md min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      {/* Fixed header skeleton mimicking SecondaryHeader */}
      <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-start max-w-md mx-auto z-50 bg-background text-foreground h-16">
        <Skeleton className="h-12 w-12 rounded-full" />
      </header>

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
