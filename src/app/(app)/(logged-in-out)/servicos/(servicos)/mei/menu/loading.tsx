import { Skeleton } from '@/components/ui/skeleton'

export default function MeiMenuLoading() {
  return (
    <div className="max-w-4xl mx-auto text-foreground pb-10">
      <div className="px-4 pt-3.4">
        <Skeleton className="mt-4 mb-2 h-9 w-24" />
        <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between py-5 text-foreground">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
