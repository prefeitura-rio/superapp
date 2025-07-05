import { Skeleton } from '@/components/ui/skeleton'

export default function UserEmailLoading() {
  return (
    <div className="max-w-md min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <div>
        {/* Fixed header skeleton mimicking SecondaryHeader */}
        <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-center max-w-md mx-auto z-50 bg-background text-foreground h-16">
          <Skeleton className="h-14 w-14 rounded-full" />
          <h1 className="text-xl font-medium w-full text-center flex items-center justify-center h-full text-foreground">
            {/* Empty title */}
          </h1>
        </header>

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
