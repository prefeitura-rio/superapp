import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <>
      <div className="max-w-md px-4 mx-auto pt-5 flex flex-col space-y-6 pb-4">
        {/* Search Input Skeleton - matching the actual SearchInput component */}
        <div className="flex h-14 items-center rounded-full bg-card px-4">
          {/* Back arrow skeleton */}
          <div className="mr-4">
            <Skeleton className="h-6 w-6" />
          </div>

          {/* Input field skeleton */}
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Search icon skeleton */}
          <div className="ml-3">
            <Skeleton className="h-6 w-6" />
          </div>
        </div>

        {/* Default state sections (when not searching) */}
        <div className="text-white space-y-3">
          {/* "Mais pesquisados" section */}
          <div>
            <Skeleton className="h-6 w-36 mb-3" />
            <div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-border"
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "Pesquisados por você" section */}
      <div className="max-w-md px-4 mx-auto pt-4 flex flex-col pb-4">
        <Skeleton className="h-6 w-40 mb-3" />
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-4 border-b border-border"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
