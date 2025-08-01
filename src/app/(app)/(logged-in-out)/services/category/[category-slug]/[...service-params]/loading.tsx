import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServiceLoading() {
  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" showSearchButton />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-20 md:pt-22 pb-20">
          {/* Service Title Skeleton */}
          <Skeleton className="h-8 w-3/4 mb-2" />

          {/* Service Description Skeleton */}
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />

          {/* Access Service Button Skeleton */}
          <Skeleton className="h-12 w-48 mb-6 rounded-full" />

          {/* Divider */}
          <div className="border-b border-border mb-6" />

          {/* Prazo Section Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Custo Section Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Como solicitar Section Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Additional sections skeleton */}
          <div className="mb-4">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mb-4">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
