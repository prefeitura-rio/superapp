import { Skeleton } from '@/components/ui/skeleton'

function AccordionItemSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={titleWidth} />
        <Skeleton className="size-5 shrink-0 rounded-full" />
      </div>
      <div className="pt-5 pb-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default function CurriculoLoading() {
  return (
    <div className="text-foreground">
      {/* MainHeader skeleton */}
      <div className="w-full bg-background py-4">
        <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
      {/* OportunidadesCariocas band skeleton */}
      <div className="w-full bg-card py-4">
        <div className="mx-auto px-4 max-w-4xl">
          <Skeleton className="h-9 w-44" />
        </div>
      </div>
      <div>
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-10">
          <Skeleton className="h-9 w-48 mt-2 mb-6" />
          <div className="w-full">
            <AccordionItemSkeleton titleWidth="h-5 w-24" />
            <AccordionItemSkeleton titleWidth="h-5 w-44" />
            <AccordionItemSkeleton titleWidth="h-5 w-28" />
            <AccordionItemSkeleton titleWidth="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}
