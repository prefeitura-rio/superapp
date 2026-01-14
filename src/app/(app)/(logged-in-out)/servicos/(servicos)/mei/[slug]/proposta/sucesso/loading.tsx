import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'

export default function MeiProposalSuccessLoading() {
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
        <div className="flex-1 flex flex-col justify-center">
          {/* Video skeleton */}
          <div className="flex items-center justify-center h-[min(328px,40vh)] max-h-[328px] mb-8">
            <Skeleton className="h-full w-full max-w-md rounded-lg" />
          </div>

          {/* Title and description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pb-12">
          <Skeleton className="w-full rounded-full h-[46px]" />
        </div>
      </div>
    </div>
  )
}
