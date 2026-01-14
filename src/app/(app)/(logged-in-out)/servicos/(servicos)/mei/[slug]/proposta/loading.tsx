import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'

export default function MeiProposalLoading() {
  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-xl mx-auto px-4 flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex-shrink-0 pt-8 pb-4">
          <CustomButton
            className="bg-card text-muted-foreground rounded-full w-11! h-11! min-h-0! p-0! hover:bg-card/80 outline-none focus:ring-0"
            disabled
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden py-8">
          {/* Step title skeleton */}
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64 mb-8" />

          {/* Form field skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Footer with button */}
        <div className="flex-shrink-0 pb-12">
          <Skeleton className="w-full rounded-full h-[46px]" />
        </div>
      </div>
    </div>
  )
}
