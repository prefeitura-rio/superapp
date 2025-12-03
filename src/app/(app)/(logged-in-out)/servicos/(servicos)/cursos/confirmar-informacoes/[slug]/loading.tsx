import { Skeleton } from '@/components/ui/skeleton'

export default function ConfirmInscriptionLoading() {
  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-xl mx-auto px-4 flex flex-col h-full">
        {/* Back button skeleton */}
        <div className="relative h-11 flex-shrink-0 pt-8 justify-self-start self-start flex items-center">
          <Skeleton className="rounded-full w-11 h-11" />
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden py-8">
          <div className="w-full space-y-10">
            {/* Title skeleton */}
            <div className="text-left">
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-3/4" />
            </div>

            {/* User data fields skeleton */}
            <div className="space-y-4 mt-3">
              {/* CPF field */}
              <div className="py-1">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Name field */}
              <div className="py-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>

              {/* Phone field */}
              <div className="py-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* Email field */}
              <div className="py-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons skeleton */}
        <div className="flex-shrink-0 pb-12">
          {/* Optional text skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex justify-center gap-3 w-full">
            <Skeleton className="h-[46px] w-[50%] rounded-full" />
            <Skeleton className="h-[46px] w-[50%] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
