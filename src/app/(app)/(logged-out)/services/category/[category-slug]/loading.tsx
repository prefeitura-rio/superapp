import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'

export default function CategoryServicesLoading() {
  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="" />
      <div className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-20">
          <nav className="flex flex-col">
            {/* Generate multiple skeleton menu items */}
            {Array.from({ length: 8 }, (_, index) => (
              <SkeletonMenuItem key={index} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

function SkeletonMenuItem() {
  return (
    <div className="border-b border-border flex items-center justify-between py-5">
      <div className="flex items-center justify-between flex-1 pr-4">
        <Skeleton className="h-5 w-3/4" />
      </div>
      <ChevronRight className="h-5 w-5 text-primary opacity-50" />
    </div>
  )
}
