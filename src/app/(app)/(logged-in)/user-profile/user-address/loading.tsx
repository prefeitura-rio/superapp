import { Skeleton } from '@/components/ui/skeleton'

export default function UserAddressLoading() {
  return (
    <div className="max-w-4xl min-h-lvh mx-auto pt-28 flex flex-col space-y-6">
      {/* Fixed header skeleton mimicking SecondaryHeader */}
      <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-start max-w-4xl mx-auto z-50 bg-background text-foreground h-16">
        <Skeleton className="h-12 w-12 rounded-full" />
      </header>

      {/* Address card skeleton */}
      <div className="px-4">
        <Skeleton className="w-full h-36 rounded-2xl" />
      </div>
    </div>
  )
}
