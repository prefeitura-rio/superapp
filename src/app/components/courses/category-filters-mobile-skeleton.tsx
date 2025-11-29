'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function CategoryFiltersMobileSkeleton() {
  return (
    <section className="mt-4 pb-8">
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex px-4 gap-2 w-max">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer shrink-0 w-20"
            >
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card w-20">
                <div className="flex items-center justify-center w-12 h-12 relative">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pt-2">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

