import { Skeleton } from '@/components/ui/skeleton'

export default function VagaDetailLoading() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Skeleton className="h-64 w-full rounded-3xl bg-muted" />
      <div className="flex items-center gap-3 mt-4">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <Skeleton className="h-5 flex-1 max-w-[200px]" />
      </div>
      <Skeleton className="h-16 w-full mt-4" />
      <Skeleton className="h-12 w-full mt-4 rounded-xl" />
      <Skeleton className="h-5 w-40 mt-6" />
      <Skeleton className="h-48 w-full mt-2 rounded-xl" />
    </div>
  )
}
