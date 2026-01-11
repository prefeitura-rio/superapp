import { Skeleton } from '@/components/ui/skeleton'

function ProposalCardSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      {/* Image container */}
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-muted w-26 h-26">
        <Skeleton className="w-full h-full" />
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export default function MinhasPropostasLoading() {
  return (
    <main className="max-w-xl min-h-lvh mx-auto text-foreground">
      <header className="px-4 py-4 relative w-full max-w-xl mx-auto bg-background text-foreground">
        <div className="flex justify-start">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <div className="px-4 pb-12">
        <div className="flex flex-col divide-y divide-border">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProposalCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  )
}
