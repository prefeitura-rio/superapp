import { ChevronLeftIcon } from '@/assets/icons'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export function CourseDetailsSkeleton() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="h-[320px] md:h-[380px] w-full relative">
          <div className="flex justify-start">
            <IconButton
              icon={ChevronLeftIcon}
              className="top-4 left-4 absolute z-10"
              onClick={() => router.back()}
            />
          </div>
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
            <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
            <Skeleton className="h-8 w-3/4 bg-white/20" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="flex justify-between p-4 text-sm">
          <div className="flex gap-4">
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>

        <div className="p-4 w-full max-w-4xl">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>

        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="p-4 space-y-6">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="space-y-1 pl-5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>

        <div className="p-4 w-full max-w-4xl">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
