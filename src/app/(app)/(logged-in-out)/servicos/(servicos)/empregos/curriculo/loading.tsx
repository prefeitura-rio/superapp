import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

function AccordionItemSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="border-b border-border py-5 last:border-b-0">
      {/* Trigger */}
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={titleWidth} />
        <Skeleton className="size-5 shrink-0 rounded-full" />
      </div>
      {/* Content */}
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
    <>
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route="/servicos/empregos"
        />
      </div>

      <div className="px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-120px)] overflow-x-hidden">
        {/* Título */}
        <Skeleton className="h-9 w-48 mt-2 mb-6" />

        {/* Accordion skeleton - 4 itens */}
        <div className="w-full">
          <AccordionItemSkeleton titleWidth="h-5 w-24" />
          <AccordionItemSkeleton titleWidth="h-5 w-44" />
          <AccordionItemSkeleton titleWidth="h-5 w-28" />
          <AccordionItemSkeleton titleWidth="h-5 w-28" />
        </div>
      </div>
    </>
  )
}
