import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryServicesLoading() {
  return (
    <div className="text-foreground">
      <header className="relative w-full z-50 bg-background py-4">
        <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center space-x-2">
            <Skeleton className="rounded-full h-11 w-11" />
            <Skeleton className="rounded-full h-11 w-11" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-4">
        <Skeleton className="h-10 w-48 mb-4 mt-2" />
        <div className="flex items-center justify-between mb-2 px-4">
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Cards skeleton */}
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2 px-4 min-w-full">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex-1 min-w-[140px] basis-0 rounded-xl min-h-[140px]"
              >
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ))}
            <div className="flex-shrink-0 sm:hidden w-2" />
          </div>
        </div>

        {/* Subcategories Accordion skeleton */}
        <div className="px-4 mt-6">
          <Accordion type="single" collapsible className="space-y-2">
            {Array.from({ length: 6 }, (_, index) => (
              <AccordionItem
                key={index}
                value={`skeleton-${index}`}
                className="rounded-2xl bg-card px-4"
              >
                <AccordionTrigger
                  className="hover:no-underline py-4 items-center"
                  chevronClassName="text-primary"
                >
                  <Skeleton className="h-5 w-40" />
                </AccordionTrigger>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
